import crypto from 'node:crypto'
import type { ILinkMessageItem } from '#contracts/weixin'

const MAX_MEDIA_BYTES = 100 * 1024 * 1024

type MediaReference = {
  encrypt_query_param?: unknown
  aes_key?: unknown
  full_url?: unknown
}

type MediaItem = {
  media?: MediaReference
  aeskey?: unknown
  file_name?: unknown
}

export async function downloadInboundMedia(params: {
  item: ILinkMessageItem
  cdnBaseUrl: string
  timeoutMs?: number
}) {
  const { media, itemData, fileName, contentType } = extractMedia(params.item)
  const fullUrl = typeof media.full_url === 'string' ? media.full_url.trim() : ''
  const queryParam =
    typeof media.encrypt_query_param === 'string' ? media.encrypt_query_param.trim() : ''
  const url = fullUrl || buildDownloadUrl(params.cdnBaseUrl, queryParam)
  if (!url) throw new Error('inbound media download reference is missing')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), params.timeoutMs ?? 15_000)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`CDN download failed with HTTP ${response.status}`)
    const contentLength = Number(response.headers.get('content-length') || 0)
    if (contentLength > MAX_MEDIA_BYTES) throw new Error('inbound media exceeds 100MB limit')
    const downloaded = Buffer.from(await response.arrayBuffer())
    if (downloaded.length > MAX_MEDIA_BYTES) throw new Error('inbound media exceeds 100MB limit')

    const aesKey = resolveAesKey(itemData)
    const buffer = aesKey ? decryptAesEcb(downloaded, aesKey) : downloaded
    if (buffer.length > MAX_MEDIA_BYTES) throw new Error('decrypted media exceeds 100MB limit')
    return {
      buffer,
      contentType: response.headers.get('content-type')?.split(';')[0] || contentType,
      fileName,
    }
  } finally {
    clearTimeout(timeout)
  }
}

function extractMedia(item: ILinkMessageItem) {
  const type = item.type
  const itemData =
    type === 2
      ? (item.image_item as MediaItem | undefined)
      : type === 3
        ? (item.voice_item as MediaItem | undefined)
        : type === 4
          ? (item.file_item as MediaItem | undefined)
          : type === 5
            ? (item.video_item as MediaItem | undefined)
            : undefined
  if (!itemData?.media) throw new Error('message item is not downloadable media')

  return {
    media: itemData.media,
    itemData,
    fileName:
      typeof itemData.file_name === 'string' && itemData.file_name
        ? itemData.file_name
        : `weixin-media-${type}`,
    contentType:
      type === 2
        ? 'image/jpeg'
        : type === 3
          ? 'audio/silk'
          : type === 5
            ? 'video/mp4'
            : 'application/octet-stream',
  }
}

function resolveAesKey(item: MediaItem) {
  if (typeof item.aeskey === 'string' && /^[0-9a-fA-F]{32}$/.test(item.aeskey)) {
    return Buffer.from(item.aeskey, 'hex')
  }
  if (typeof item.media?.aes_key === 'string') {
    const key = Buffer.from(item.media.aes_key, 'base64')
    if (key.length === 16) return key
    if (key.length === 32 && /^[0-9a-fA-F]{32}$/.test(key.toString('ascii'))) {
      return Buffer.from(key.toString('ascii'), 'hex')
    }
  }
  return null
}

function buildDownloadUrl(cdnBaseUrl: string, encryptedQueryParam: string) {
  if (!encryptedQueryParam) return ''
  const base = cdnBaseUrl.endsWith('/') ? cdnBaseUrl : `${cdnBaseUrl}/`
  const url = new URL('download', base)
  url.searchParams.set('encrypted_query_param', encryptedQueryParam)
  return url.toString()
}

function decryptAesEcb(ciphertext: Buffer, key: Buffer) {
  const decipher = crypto.createDecipheriv('aes-128-ecb', key, null)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()])
}

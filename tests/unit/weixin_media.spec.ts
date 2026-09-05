import { createDecipheriv } from 'node:crypto'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from '@japa/runner'
import { aesEcbPaddedSize, encryptAesEcb, uploadAndSendMedia } from '#services/weixin/media_service'
import { downloadInboundMedia } from '#services/weixin/media_download_service'
import { signWebhookPayload, webhookRetryDelayMs } from '#services/weixin/webhook_service'
import { sanitizeProtocolPayload } from '#services/weixin/payload_sanitizer'
import {
  decodeMessagePayload,
  encodeMessagePayload,
} from '#services/weixin/message_payload_service'

test('AES-128-ECB uses PKCS#7 padded ciphertext sizes', ({ assert }) => {
  assert.equal(aesEcbPaddedSize(0), 16)
  assert.equal(aesEcbPaddedSize(16), 32)
  assert.equal(aesEcbPaddedSize(17), 32)

  const plaintext = Buffer.from('wechat-ilink')
  const key = Buffer.alloc(16, 7)
  const encrypted = encryptAesEcb(plaintext, key)
  const decipher = createDecipheriv('aes-128-ecb', key, null)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  assert.deepEqual(decrypted, plaintext)
})

test('Webhook signatures are HMAC-SHA256 over the raw request body', ({ assert }) => {
  assert.equal(
    signWebhookPayload('{"ok":true}', 'secret'),
    'f6b4a2841c93f8bf2fb8f2c13d8fb0b6c8e8019f09ee405d248daa8385fad638'
  )
})

test('Webhook retries use bounded exponential backoff', ({ assert }) => {
  assert.equal(webhookRetryDelayMs(1), 5_000)
  assert.equal(webhookRetryDelayMs(2), 30_000)
  assert.equal(webhookRetryDelayMs(3), 300_000)
  assert.equal(webhookRetryDelayMs(5), 1_800_000)
})

test('public protocol payloads remove credentials and CDN secrets', ({ assert }) => {
  assert.deepEqual(
    sanitizeProtocolPayload({
      context_token: 'ctx',
      item_list: [{ image_item: { media: { aes_key: 'key', encrypt_query_param: 'param' } } }],
      text_item: { text: 'hello' },
    }),
    {
      item_list: [{ image_item: { media: {} } }],
      text_item: { text: 'hello' },
    }
  )
})

test('message audit payloads are encrypted at rest', ({ assert }) => {
  const encoded = encodeMessagePayload({ context_token: 'ctx', text: 'hello' })
  assert.notInclude(encoded, 'context_token')
  assert.deepEqual(decodeMessagePayload(encoded), { context_token: 'ctx', text: 'hello' })
})

test('uploads encrypted media and sends the correct iLink item', async ({ assert }) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'wechat-ilink-api-'))
  const filePath = path.join(directory, 'notes.txt')
  const plaintext = Buffer.from('hello from the API')
  await writeFile(filePath, plaintext)

  const originalFetch = globalThis.fetch
  let uploadBody: Uint8Array | undefined
  let uploadParams: Record<string, unknown> | undefined
  const sentMessages: Record<string, unknown>[] = []
  globalThis.fetch = (async (_input, init) => {
    uploadBody = init?.body as Uint8Array
    return new Response(null, {
      status: 200,
      headers: { 'x-encrypted-param': 'download-param' },
    })
  }) as typeof fetch

  const client = {
    getUploadUrl: async (params: Record<string, unknown>) => {
      uploadParams = params
      return { upload_param: 'upload-param' }
    },
    sendMessage: async (message: Record<string, unknown>) => {
      sentMessages.push(message)
      return { clientId: message.client_id ?? 'generated-client-id' }
    },
  }

  try {
    const result = await uploadAndSendMedia({
      client: client as never,
      cdnBaseUrl: 'https://cdn.example/c2c',
      filePath,
      mediaType: 'file',
      toUserId: 'user-1',
      caption: '附件',
      clientMessageId: 'client-1',
      runId: 'run-1',
    })

    assert.equal(result.clientId, 'client-1')
    assert.equal(result.mediaType, 'file')
    assert.equal(result.rawSize, plaintext.length)
    assert.equal(uploadParams?.mediaType, 3)
    assert.equal(uploadParams?.rawSize, plaintext.length)
    assert.equal(uploadBody?.length, aesEcbPaddedSize(plaintext.length))
    assert.equal(sentMessages.length, 2)
    assert.equal(sentMessages[0]?.to_user_id, 'user-1')
    assert.equal(sentMessages[0]?.run_id, 'run-1')
    assert.deepEqual(sentMessages[0]?.item_list, [{ type: 1, text_item: { text: '附件' } }])
    assert.equal(sentMessages[1]?.to_user_id, 'user-1')
    assert.equal(sentMessages[1]?.client_id, 'client-1')
    assert.equal(sentMessages[1]?.run_id, 'run-1')
    assert.deepEqual(sentMessages[1]?.item_list, [
      {
        type: 4,
        file_item: {
          media: {
            encrypt_query_param: 'download-param',
            aes_key: Buffer.from(String(uploadParams?.aesKey), 'utf8').toString('base64'),
            encrypt_type: 1,
          },
          file_name: 'notes.txt',
          len: String(plaintext.length),
        },
      },
    ])
  } finally {
    globalThis.fetch = originalFetch
    await rm(directory, { recursive: true, force: true })
  }
})

test('image media uses openclaw-weixin AES key wire encoding and ciphertext size', async ({
  assert,
}) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'wechat-ilink-api-'))
  const filePath = path.join(directory, 'photo.jpg')
  const plaintext = Buffer.from('fake image bytes')
  await writeFile(filePath, plaintext)

  const originalFetch = globalThis.fetch
  let uploadBody: Uint8Array | undefined
  let uploadParams: Record<string, unknown> | undefined
  const sentMessages: Record<string, unknown>[] = []
  globalThis.fetch = (async (_input, init) => {
    uploadBody = init?.body as Uint8Array
    return new Response(null, {
      status: 200,
      headers: { 'x-encrypted-param': 'image-download-param' },
    })
  }) as typeof fetch

  const client = {
    getUploadUrl: async (params: Record<string, unknown>) => {
      uploadParams = params
      return { upload_param: 'image-upload-param' }
    },
    sendMessage: async (message: Record<string, unknown>) => {
      sentMessages.push(message)
      return { clientId: 'image-client-id' }
    },
  }

  try {
    await uploadAndSendMedia({
      client: client as never,
      cdnBaseUrl: 'https://cdn.example/c2c',
      filePath,
      mediaType: 'image',
      toUserId: 'user-1',
      clientMessageId: 'image-client-id',
    })

    assert.equal(uploadParams?.mediaType, 1)
    assert.equal(uploadParams?.rawSize, plaintext.length)
    assert.equal(uploadBody?.length, aesEcbPaddedSize(plaintext.length))
    assert.equal(sentMessages.length, 1)

    const message = sentMessages[0] as {
      item_list: [{ type: number; image_item: { media: { aes_key: string }; mid_size: number } }]
    }
    const imageItem = message.item_list[0]
    assert.equal(imageItem.type, 2)
    assert.equal(imageItem.image_item.mid_size, uploadBody?.length)

    // iLink expects base64(ASCII hex key), matching openclaw-weixin's send path.
    const wireKey = Buffer.from(imageItem.image_item.media.aes_key, 'base64').toString('utf8')
    assert.match(wireKey, /^[0-9a-f]{32}$/)
    assert.equal(Buffer.from(wireKey, 'hex').length, 16)
  } finally {
    globalThis.fetch = originalFetch
    await rm(directory, { recursive: true, force: true })
  }
})

test('downloads and decrypts inbound CDN media', async ({ assert }) => {
  const plaintext = Buffer.from('inbound attachment')
  const key = Buffer.alloc(16, 3)
  const ciphertext = encryptAesEcb(plaintext, key)
  const originalFetch = globalThis.fetch
  let requestedUrl = ''
  globalThis.fetch = (async (input) => {
    requestedUrl = String(input)
    return new Response(ciphertext, {
      status: 200,
      headers: { 'content-type': 'application/octet-stream' },
    })
  }) as typeof fetch

  try {
    const result = await downloadInboundMedia({
      cdnBaseUrl: 'https://cdn.example/c2c',
      item: {
        type: 4,
        file_item: {
          file_name: 'report.txt',
          media: {
            encrypt_query_param: 'encrypted-param',
            aes_key: key.toString('base64'),
          },
        },
      },
    })
    assert.equal(
      requestedUrl,
      'https://cdn.example/c2c/download?encrypted_query_param=encrypted-param'
    )
    assert.deepEqual(result.buffer, plaintext)
    assert.equal(result.fileName, 'report.txt')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('downloads media when inbound aes_key is base64-encoded ASCII hex', async ({ assert }) => {
  const plaintext = Buffer.from('inbound image')
  const key = Buffer.alloc(16, 9)
  const ciphertext = encryptAesEcb(plaintext, key)
  const originalFetch = globalThis.fetch
  globalThis.fetch = (async () =>
    new Response(ciphertext, {
      status: 200,
      headers: { 'content-type': 'image/jpeg' },
    })) as typeof fetch

  try {
    const result = await downloadInboundMedia({
      cdnBaseUrl: 'https://cdn.example/c2c',
      item: {
        type: 2,
        image_item: {
          media: {
            encrypt_query_param: 'image-encrypted-param',
            aes_key: Buffer.from(key.toString('hex'), 'utf8').toString('base64'),
          },
        },
      },
    })
    assert.deepEqual(result.buffer, plaintext)
    assert.equal(result.contentType, 'image/jpeg')
    assert.equal(result.fileName, 'weixin-media-2')
  } finally {
    globalThis.fetch = originalFetch
  }
})

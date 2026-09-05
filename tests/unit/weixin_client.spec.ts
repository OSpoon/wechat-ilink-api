import { test } from '@japa/runner'
import ILinkClient, { ILinkError, sanitizeBotAgent } from '#services/weixin/ilink_client'

function response(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

test('iLink QR code requests use the upstream header split', async ({ assert }) => {
  const originalFetch = globalThis.fetch
  let requestUrl = ''
  let requestInit: RequestInit | undefined
  globalThis.fetch = (async (input, init) => {
    requestUrl = String(input)
    requestInit = init
    return response({ qrcode: 'qr', qrcode_img_content: 'https://example.test/qr' })
  }) as typeof fetch

  try {
    await new ILinkClient({ baseUrl: 'https://ilink.example', token: 'secret' }).getBotQrCode('3')
    const headers = requestInit?.headers as Record<string, string>
    assert.include(requestUrl, '/ilink/bot/get_bot_qrcode?bot_type=3')
    assert.equal(headers.AuthorizationType, 'ilink_bot_token')
    assert.isString(headers['X-WECHAT-UIN'])
    assert.notProperty(headers, 'Authorization')

    await new ILinkClient({ baseUrl: 'https://ilink.example', token: 'secret' }).getQrCodeStatus(
      'qr'
    )
    const statusHeaders = requestInit?.headers as Record<string, string>
    assert.notProperty(statusHeaders, 'AuthorizationType')
    assert.notProperty(statusHeaders, 'X-WECHAT-UIN')
    assert.notProperty(statusHeaders, 'Authorization')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('iLink getupdates converts client aborts into an empty poll response', async ({ assert }) => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = (async () => {
    const error = new Error('aborted')
    error.name = 'AbortError'
    throw error
  }) as typeof fetch

  try {
    const result = await new ILinkClient({ baseUrl: 'https://ilink.example' }).getUpdates(
      'cursor',
      100
    )
    assert.equal(result.ret, 0)
    assert.deepEqual(result.msgs, [])
    assert.equal(result.get_updates_buf, 'cursor')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('iLink errors preserve ret when errcode is zero', async ({ assert }) => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = (async () =>
    response({ ret: -14, errcode: 0, errmsg: 'stale token' })) as typeof fetch

  try {
    try {
      await new ILinkClient({ baseUrl: 'https://ilink.example' }).getUpdates('', 100)
      assert.fail('expected stale-token error')
    } catch (error) {
      assert.isTrue(error instanceof ILinkError)
      assert.equal((error as ILinkError).code, -14)
    }
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('iLink text messages preserve run_id and omit empty item_list', async ({ assert }) => {
  const originalFetch = globalThis.fetch
  let requestInit: RequestInit | undefined
  globalThis.fetch = (async (_input, init) => {
    requestInit = init
    return response({ ret: 0 })
  }) as typeof fetch

  try {
    await new ILinkClient({ baseUrl: 'https://ilink.example' }).sendText(
      'user-1',
      '',
      undefined,
      'client-1',
      'run-1'
    )
    const body = JSON.parse(String(requestInit?.body)) as {
      msg: { item_list?: unknown; run_id?: string }
    }
    assert.notProperty(body.msg, 'item_list')
    assert.equal(body.msg.run_id, 'run-1')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('iLink upload requests preserve media metadata and disable thumbnails', async ({ assert }) => {
  const originalFetch = globalThis.fetch
  let requestInit: RequestInit | undefined
  globalThis.fetch = (async (_input, init) => {
    requestInit = init
    return response({ upload_param: 'upload-param' })
  }) as typeof fetch

  try {
    await new ILinkClient({ baseUrl: 'https://ilink.example' }).getUploadUrl({
      filekey: 'file-key',
      mediaType: 1,
      toUserId: 'user-1',
      rawSize: 123,
      rawFileMd5: 'md5',
      fileSize: 128,
      aesKey: '00112233445566778899aabbccddeeff',
    })
    const body = JSON.parse(String(requestInit?.body)) as Record<string, any>
    assert.equal(body.filekey, 'file-key')
    assert.equal(body.media_type, 1)
    assert.equal(body.to_user_id, 'user-1')
    assert.equal(body.rawsize, 123)
    assert.equal(body.rawfilemd5, 'md5')
    assert.equal(body.filesize, 128)
    assert.isTrue(body.no_need_thumb)
    assert.equal(body.aeskey, '00112233445566778899aabbccddeeff')
    assert.equal(body.base_info.bot_agent, 'OpenClaw')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('bot_agent follows openclaw-weixin sanitization rules', ({ assert }) => {
  assert.equal(sanitizeBotAgent('OpenClaw'), 'OpenClaw')
  assert.equal(sanitizeBotAgent('gateway/1.2 (wechat api)'), 'gateway/1.2 (wechat api)')
  assert.equal(sanitizeBotAgent('not a valid agent'), 'OpenClaw')
})

import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import WeixinLoginSession from '#models/weixin_login_session'

test.group('微信 API response contract', (group) => {
  let rollback: (() => Promise<void>) | undefined
  let accessToken = ''
  let loginSessionId = ''
  let userEmail = ''

  group.setup(async () => {
    rollback = await testUtils.db().migrate()

    userEmail = `http-${randomUUID()}@example.test`
    const user = await User.create({
      fullName: 'HTTP Test User',
      email: userEmail,
      password: 'test-password-123',
    })
    const token = await User.accessTokens.create(user)
    accessToken = token.value!.release()

    const session = await WeixinLoginSession.create({
      id: `wxlogin_${randomUUID()}`,
      userId: user.id,
      qrcode: 'test-qrcode',
      qrcodeUrl: 'https://example.test/qr/test-qrcode',
      status: 'waiting_scan',
      botType: '3',
      pollingBaseUrl: 'https://ilink.example',
      expiresAt: DateTime.utc().plus({ minutes: 5 }),
    })
    loginSessionId = session.id
  })

  group.teardown(async () => {
    await rollback?.()
  })

  test('authenticated profile returns a non-empty serialized data object', async ({
    assert,
    client,
  }) => {
    const response = await client.get('/api/v1/account/profile').bearerToken(accessToken)

    response.assertStatus(200)
    const body = response.body() as unknown as { data: { email: string } }
    assert.equal(body.data.email, userEmail)
    assert.isObject(body.data)
  })

  test('empty account and webhook collections are serialized as data arrays', async ({
    assert,
    client,
  }) => {
    const accounts = await client.get('/api/v1/weixin/accounts').bearerToken(accessToken)
    accounts.assertStatus(200)
    const accountsBody = accounts.body() as unknown as { data: unknown[] }
    assert.deepEqual(accountsBody, { data: [] })

    const webhooks = await client.get('/api/v1/weixin/webhooks').bearerToken(accessToken)
    webhooks.assertStatus(200)
    const webhooksBody = webhooks.body() as unknown as { data: unknown[] }
    assert.deepEqual(webhooksBody, { data: [] })
    assert.isArray(webhooksBody.data)
  })

  test('login session status includes the returned string session id', async ({
    assert,
    client,
  }) => {
    const response = await client
      .get(`/api/v1/weixin/login-sessions/${loginSessionId}`)
      .bearerToken(accessToken)

    response.assertStatus(200)
    const body = response.body() as unknown as {
      data: { id: string; status: string; qrUrl: string }
    }
    assert.equal(body.data.id, loginSessionId)
    assert.equal(body.data.status, 'waiting_scan')
    assert.equal(body.data.qrUrl, 'https://example.test/qr/test-qrcode')
  })
})

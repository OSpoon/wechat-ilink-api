/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
import { apiThrottle, qrThrottle } from '#start/limiter'
import db from '@adonisjs/lucid/services/db'
import { localizeOpenApiDocument } from '#services/openapi_localizer'

const weixinAccounts = () => import('#controllers/weixin/accounts_controller')
const weixinLoginSessions = () => import('#controllers/weixin/login_sessions_controller')
const weixinMessages = () => import('#controllers/weixin/messages_controller')
const weixinMedia = () => import('#controllers/weixin/media_controller')
const weixinMediaDownload = () => import('#controllers/weixin/media_download_controller')
const weixinTyping = () => import('#controllers/weixin/typing_controller')
const weixinWebhooks = () => import('#controllers/weixin/webhooks_controller')

type AutoSwaggerInstance = {
  json(routes: unknown, options: unknown): Promise<unknown>
  ui(url: string, options: unknown): string
}

// The package is CommonJS and exposes the instance as a nested default when
// loaded by native ESM. Keep the interop detail isolated to this boundary.
const autoSwagger = (AutoSwagger as unknown as { default: AutoSwaggerInstance }).default

router.get('/', () => {
  return { hello: 'world' }
})

router.get('/health/live', ({ response }) => response.ok({ status: 'ok' }))

router.get('/health/ready', async ({ response }) => {
  try {
    await db.rawQuery('select 1')
    return response.ok({ status: 'ok', database: 'ok' })
  } catch {
    return response.serviceUnavailable({ status: 'unavailable', database: 'unavailable' })
  }
})

router.get('/openapi.json', async ({ response }) => {
  const document = localizeOpenApiDocument(await autoSwagger.json(router.toJSON(), swagger))
  response.header('Cache-Control', 'no-store, no-cache, must-revalidate')
  return response.type('application/json').send(document)
})

router.get('/docs', async ({ response }) => {
  response.header('Cache-Control', 'no-store, no-cache, must-revalidate')
  return response.type('text/html').send(autoSwagger.ui('/openapi.json', swagger))
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())
  })
  .prefix('/api/v1')
  .use(apiThrottle)

router
  .group(() => {
    router.get('accounts', [weixinAccounts, 'index'])
    router.get('accounts/:accountId', [weixinAccounts, 'show'])
    router.post('accounts/:accountId/start', [weixinAccounts, 'start'])
    router.post('accounts/:accountId/stop', [weixinAccounts, 'stop'])

    router.post('login-sessions', [weixinLoginSessions, 'store']).use(qrThrottle)
    router.get('login-sessions/:sessionId', [weixinLoginSessions, 'show'])
    router.post('login-sessions/:sessionId/verify', [weixinLoginSessions, 'verify'])
    router.delete('login-sessions/:sessionId', [weixinLoginSessions, 'destroy'])

    router.get('accounts/:accountId/messages', [weixinMessages, 'index'])
    router.get('accounts/:accountId/messages/:messageId/media/:itemIndex', [
      weixinMediaDownload,
      'show',
    ])
    router.post('accounts/:accountId/messages', [weixinMessages, 'store'])
    router.post('accounts/:accountId/messages/media', [weixinMedia, 'store'])
    router.post('accounts/:accountId/typing', [weixinTyping, 'store'])
    router.get('webhooks', [weixinWebhooks, 'index'])
    router.post('webhooks', [weixinWebhooks, 'store'])
    router.get('webhooks/:webhookId/deliveries', [weixinWebhooks, 'deliveries'])
    router.delete('webhooks/:webhookId', [weixinWebhooks, 'destroy'])
  })
  .prefix('/api/v1/weixin')
  .use(middleware.auth())
  .use(apiThrottle)

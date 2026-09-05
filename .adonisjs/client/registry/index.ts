/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'system.index': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['system.index']['types'],
  },
  'system.live': {
    methods: ["GET","HEAD"],
    pattern: '/health/live',
    tokens: [{"old":"/health/live","type":0,"val":"health","end":""},{"old":"/health/live","type":0,"val":"live","end":""}],
    types: placeholder as Registry['system.live']['types'],
  },
  'system.ready': {
    methods: ["GET","HEAD"],
    pattern: '/health/ready',
    tokens: [{"old":"/health/ready","type":0,"val":"health","end":""},{"old":"/health/ready","type":0,"val":"ready","end":""}],
    types: placeholder as Registry['system.ready']['types'],
  },
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_tokens.store']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [{"old":"/api/v1/account/logout","type":0,"val":"api","end":""},{"old":"/api/v1/account/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/account/logout","type":0,"val":"account","end":""},{"old":"/api/v1/account/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['profile.access_tokens.destroy']['types'],
  },
  'weixin_accounts.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/weixin/accounts',
    tokens: [{"old":"/api/v1/weixin/accounts","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/accounts","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/accounts","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/accounts","type":0,"val":"accounts","end":""}],
    types: placeholder as Registry['weixin_accounts.index']['types'],
  },
  'weixin_accounts.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/weixin/accounts/:accountId',
    tokens: [{"old":"/api/v1/weixin/accounts/:accountId","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/accounts/:accountId","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/accounts/:accountId","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/accounts/:accountId","type":0,"val":"accounts","end":""},{"old":"/api/v1/weixin/accounts/:accountId","type":1,"val":"accountId","end":""}],
    types: placeholder as Registry['weixin_accounts.show']['types'],
  },
  'weixin_accounts.start': {
    methods: ["POST"],
    pattern: '/api/v1/weixin/accounts/:accountId/start',
    tokens: [{"old":"/api/v1/weixin/accounts/:accountId/start","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/accounts/:accountId/start","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/accounts/:accountId/start","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/accounts/:accountId/start","type":0,"val":"accounts","end":""},{"old":"/api/v1/weixin/accounts/:accountId/start","type":1,"val":"accountId","end":""},{"old":"/api/v1/weixin/accounts/:accountId/start","type":0,"val":"start","end":""}],
    types: placeholder as Registry['weixin_accounts.start']['types'],
  },
  'weixin_accounts.stop': {
    methods: ["POST"],
    pattern: '/api/v1/weixin/accounts/:accountId/stop',
    tokens: [{"old":"/api/v1/weixin/accounts/:accountId/stop","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/accounts/:accountId/stop","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/accounts/:accountId/stop","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/accounts/:accountId/stop","type":0,"val":"accounts","end":""},{"old":"/api/v1/weixin/accounts/:accountId/stop","type":1,"val":"accountId","end":""},{"old":"/api/v1/weixin/accounts/:accountId/stop","type":0,"val":"stop","end":""}],
    types: placeholder as Registry['weixin_accounts.stop']['types'],
  },
  'weixin_login_sessions.store': {
    methods: ["POST"],
    pattern: '/api/v1/weixin/login-sessions',
    tokens: [{"old":"/api/v1/weixin/login-sessions","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/login-sessions","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/login-sessions","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/login-sessions","type":0,"val":"login-sessions","end":""}],
    types: placeholder as Registry['weixin_login_sessions.store']['types'],
  },
  'weixin_login_sessions.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/weixin/login-sessions/:sessionId',
    tokens: [{"old":"/api/v1/weixin/login-sessions/:sessionId","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/login-sessions/:sessionId","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/login-sessions/:sessionId","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/login-sessions/:sessionId","type":0,"val":"login-sessions","end":""},{"old":"/api/v1/weixin/login-sessions/:sessionId","type":1,"val":"sessionId","end":""}],
    types: placeholder as Registry['weixin_login_sessions.show']['types'],
  },
  'weixin_login_sessions.verify': {
    methods: ["POST"],
    pattern: '/api/v1/weixin/login-sessions/:sessionId/verify',
    tokens: [{"old":"/api/v1/weixin/login-sessions/:sessionId/verify","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/login-sessions/:sessionId/verify","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/login-sessions/:sessionId/verify","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/login-sessions/:sessionId/verify","type":0,"val":"login-sessions","end":""},{"old":"/api/v1/weixin/login-sessions/:sessionId/verify","type":1,"val":"sessionId","end":""},{"old":"/api/v1/weixin/login-sessions/:sessionId/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['weixin_login_sessions.verify']['types'],
  },
  'weixin_login_sessions.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/weixin/login-sessions/:sessionId',
    tokens: [{"old":"/api/v1/weixin/login-sessions/:sessionId","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/login-sessions/:sessionId","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/login-sessions/:sessionId","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/login-sessions/:sessionId","type":0,"val":"login-sessions","end":""},{"old":"/api/v1/weixin/login-sessions/:sessionId","type":1,"val":"sessionId","end":""}],
    types: placeholder as Registry['weixin_login_sessions.destroy']['types'],
  },
  'weixin_messages.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/weixin/accounts/:accountId/messages',
    tokens: [{"old":"/api/v1/weixin/accounts/:accountId/messages","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages","type":0,"val":"accounts","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages","type":1,"val":"accountId","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages","type":0,"val":"messages","end":""}],
    types: placeholder as Registry['weixin_messages.index']['types'],
  },
  'weixin_media_download.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/weixin/accounts/:accountId/messages/:messageId/media/:itemIndex',
    tokens: [{"old":"/api/v1/weixin/accounts/:accountId/messages/:messageId/media/:itemIndex","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages/:messageId/media/:itemIndex","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages/:messageId/media/:itemIndex","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages/:messageId/media/:itemIndex","type":0,"val":"accounts","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages/:messageId/media/:itemIndex","type":1,"val":"accountId","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages/:messageId/media/:itemIndex","type":0,"val":"messages","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages/:messageId/media/:itemIndex","type":1,"val":"messageId","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages/:messageId/media/:itemIndex","type":0,"val":"media","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages/:messageId/media/:itemIndex","type":1,"val":"itemIndex","end":""}],
    types: placeholder as Registry['weixin_media_download.show']['types'],
  },
  'weixin_messages.store': {
    methods: ["POST"],
    pattern: '/api/v1/weixin/accounts/:accountId/messages',
    tokens: [{"old":"/api/v1/weixin/accounts/:accountId/messages","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages","type":0,"val":"accounts","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages","type":1,"val":"accountId","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages","type":0,"val":"messages","end":""}],
    types: placeholder as Registry['weixin_messages.store']['types'],
  },
  'weixin_media.store': {
    methods: ["POST"],
    pattern: '/api/v1/weixin/accounts/:accountId/messages/media',
    tokens: [{"old":"/api/v1/weixin/accounts/:accountId/messages/media","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages/media","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages/media","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages/media","type":0,"val":"accounts","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages/media","type":1,"val":"accountId","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages/media","type":0,"val":"messages","end":""},{"old":"/api/v1/weixin/accounts/:accountId/messages/media","type":0,"val":"media","end":""}],
    types: placeholder as Registry['weixin_media.store']['types'],
  },
  'weixin_typing.store': {
    methods: ["POST"],
    pattern: '/api/v1/weixin/accounts/:accountId/typing',
    tokens: [{"old":"/api/v1/weixin/accounts/:accountId/typing","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/accounts/:accountId/typing","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/accounts/:accountId/typing","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/accounts/:accountId/typing","type":0,"val":"accounts","end":""},{"old":"/api/v1/weixin/accounts/:accountId/typing","type":1,"val":"accountId","end":""},{"old":"/api/v1/weixin/accounts/:accountId/typing","type":0,"val":"typing","end":""}],
    types: placeholder as Registry['weixin_typing.store']['types'],
  },
  'weixin_webhooks.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/weixin/webhooks',
    tokens: [{"old":"/api/v1/weixin/webhooks","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/webhooks","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/webhooks","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/webhooks","type":0,"val":"webhooks","end":""}],
    types: placeholder as Registry['weixin_webhooks.index']['types'],
  },
  'weixin_webhooks.store': {
    methods: ["POST"],
    pattern: '/api/v1/weixin/webhooks',
    tokens: [{"old":"/api/v1/weixin/webhooks","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/webhooks","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/webhooks","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/webhooks","type":0,"val":"webhooks","end":""}],
    types: placeholder as Registry['weixin_webhooks.store']['types'],
  },
  'weixin_webhooks.deliveries': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/weixin/webhooks/:webhookId/deliveries',
    tokens: [{"old":"/api/v1/weixin/webhooks/:webhookId/deliveries","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/webhooks/:webhookId/deliveries","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/webhooks/:webhookId/deliveries","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/webhooks/:webhookId/deliveries","type":0,"val":"webhooks","end":""},{"old":"/api/v1/weixin/webhooks/:webhookId/deliveries","type":1,"val":"webhookId","end":""},{"old":"/api/v1/weixin/webhooks/:webhookId/deliveries","type":0,"val":"deliveries","end":""}],
    types: placeholder as Registry['weixin_webhooks.deliveries']['types'],
  },
  'weixin_webhooks.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/weixin/webhooks/:webhookId',
    tokens: [{"old":"/api/v1/weixin/webhooks/:webhookId","type":0,"val":"api","end":""},{"old":"/api/v1/weixin/webhooks/:webhookId","type":0,"val":"v1","end":""},{"old":"/api/v1/weixin/webhooks/:webhookId","type":0,"val":"weixin","end":""},{"old":"/api/v1/weixin/webhooks/:webhookId","type":0,"val":"webhooks","end":""},{"old":"/api/v1/weixin/webhooks/:webhookId","type":1,"val":"webhookId","end":""}],
    types: placeholder as Registry['weixin_webhooks.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}

/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'system.index': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_controller').default['index']>>>
    }
  }
  'system.live': {
    methods: ["GET","HEAD"]
    pattern: '/health/live'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_controller').default['live']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_controller').default['live']>>>
    }
  }
  'system.ready': {
    methods: ["GET","HEAD"]
    pattern: '/health/ready'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_controller').default['ready']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_controller').default['ready']>>>
    }
  }
  'auth.new_account.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_tokens.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'profile.access_tokens.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/account/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
    }
  }
  'weixin_accounts.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/weixin/accounts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/accounts_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/accounts_controller').default['index']>>>
    }
  }
  'weixin_accounts.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/weixin/accounts/:accountId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { accountId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/accounts_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/accounts_controller').default['show']>>>
    }
  }
  'weixin_accounts.start': {
    methods: ["POST"]
    pattern: '/api/v1/weixin/accounts/:accountId/start'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { accountId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/accounts_controller').default['start']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/accounts_controller').default['start']>>>
    }
  }
  'weixin_accounts.stop': {
    methods: ["POST"]
    pattern: '/api/v1/weixin/accounts/:accountId/stop'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { accountId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/accounts_controller').default['stop']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/accounts_controller').default['stop']>>>
    }
  }
  'weixin_login_sessions.store': {
    methods: ["POST"]
    pattern: '/api/v1/weixin/login-sessions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/login_sessions_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/login_sessions_controller').default['store']>>>
    }
  }
  'weixin_login_sessions.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/weixin/login-sessions/:sessionId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { sessionId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/login_sessions_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/login_sessions_controller').default['show']>>>
    }
  }
  'weixin_login_sessions.verify': {
    methods: ["POST"]
    pattern: '/api/v1/weixin/login-sessions/:sessionId/verify'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/weixin').verifyCodeValidator)>>
      paramsTuple: [ParamValue]
      params: { sessionId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/weixin').verifyCodeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/login_sessions_controller').default['verify']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/login_sessions_controller').default['verify']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'weixin_login_sessions.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/weixin/login-sessions/:sessionId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { sessionId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/login_sessions_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/login_sessions_controller').default['destroy']>>>
    }
  }
  'weixin_messages.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/weixin/accounts/:accountId/messages'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { accountId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/messages_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/messages_controller').default['index']>>>
    }
  }
  'weixin_media_download.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/weixin/accounts/:accountId/messages/:messageId/media/:itemIndex'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { accountId: ParamValue; messageId: ParamValue; itemIndex: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/media_download_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/media_download_controller').default['show']>>>
    }
  }
  'weixin_messages.store': {
    methods: ["POST"]
    pattern: '/api/v1/weixin/accounts/:accountId/messages'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/weixin').sendTextMessageValidator)>>
      paramsTuple: [ParamValue]
      params: { accountId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/weixin').sendTextMessageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/messages_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/messages_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'weixin_media.store': {
    methods: ["POST"]
    pattern: '/api/v1/weixin/accounts/:accountId/messages/media'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/weixin').sendMediaMessageValidator)>>
      paramsTuple: [ParamValue]
      params: { accountId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/weixin').sendMediaMessageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/media_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/media_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'weixin_typing.store': {
    methods: ["POST"]
    pattern: '/api/v1/weixin/accounts/:accountId/typing'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/weixin').typingValidator)>>
      paramsTuple: [ParamValue]
      params: { accountId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/weixin').typingValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/typing_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/typing_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'weixin_webhooks.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/weixin/webhooks'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/webhooks_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/webhooks_controller').default['index']>>>
    }
  }
  'weixin_webhooks.store': {
    methods: ["POST"]
    pattern: '/api/v1/weixin/webhooks'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/weixin').createWebhookValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/weixin').createWebhookValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/webhooks_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/webhooks_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'weixin_webhooks.deliveries': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/weixin/webhooks/:webhookId/deliveries'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { webhookId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/webhooks_controller').default['deliveries']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/webhooks_controller').default['deliveries']>>>
    }
  }
  'weixin_webhooks.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/weixin/webhooks/:webhookId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { webhookId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weixin/webhooks_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weixin/webhooks_controller').default['destroy']>>>
    }
  }
}

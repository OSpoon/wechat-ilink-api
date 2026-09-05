import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'weixin_accounts.index': { paramsTuple?: []; params?: {} }
    'weixin_accounts.show': { paramsTuple: [ParamValue]; params: {'accountId': ParamValue} }
    'weixin_accounts.start': { paramsTuple: [ParamValue]; params: {'accountId': ParamValue} }
    'weixin_accounts.stop': { paramsTuple: [ParamValue]; params: {'accountId': ParamValue} }
    'weixin_login_sessions.store': { paramsTuple?: []; params?: {} }
    'weixin_login_sessions.show': { paramsTuple: [ParamValue]; params: {'sessionId': ParamValue} }
    'weixin_login_sessions.verify': { paramsTuple: [ParamValue]; params: {'sessionId': ParamValue} }
    'weixin_login_sessions.destroy': { paramsTuple: [ParamValue]; params: {'sessionId': ParamValue} }
    'weixin_messages.index': { paramsTuple: [ParamValue]; params: {'accountId': ParamValue} }
    'weixin_media_download.show': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'accountId': ParamValue,'messageId': ParamValue,'itemIndex': ParamValue} }
    'weixin_messages.store': { paramsTuple: [ParamValue]; params: {'accountId': ParamValue} }
    'weixin_media.store': { paramsTuple: [ParamValue]; params: {'accountId': ParamValue} }
    'weixin_typing.store': { paramsTuple: [ParamValue]; params: {'accountId': ParamValue} }
    'weixin_webhooks.index': { paramsTuple?: []; params?: {} }
    'weixin_webhooks.store': { paramsTuple?: []; params?: {} }
    'weixin_webhooks.deliveries': { paramsTuple: [ParamValue]; params: {'webhookId': ParamValue} }
    'weixin_webhooks.destroy': { paramsTuple: [ParamValue]; params: {'webhookId': ParamValue} }
  }
  GET: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'weixin_accounts.index': { paramsTuple?: []; params?: {} }
    'weixin_accounts.show': { paramsTuple: [ParamValue]; params: {'accountId': ParamValue} }
    'weixin_login_sessions.show': { paramsTuple: [ParamValue]; params: {'sessionId': ParamValue} }
    'weixin_messages.index': { paramsTuple: [ParamValue]; params: {'accountId': ParamValue} }
    'weixin_media_download.show': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'accountId': ParamValue,'messageId': ParamValue,'itemIndex': ParamValue} }
    'weixin_webhooks.index': { paramsTuple?: []; params?: {} }
    'weixin_webhooks.deliveries': { paramsTuple: [ParamValue]; params: {'webhookId': ParamValue} }
  }
  HEAD: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'weixin_accounts.index': { paramsTuple?: []; params?: {} }
    'weixin_accounts.show': { paramsTuple: [ParamValue]; params: {'accountId': ParamValue} }
    'weixin_login_sessions.show': { paramsTuple: [ParamValue]; params: {'sessionId': ParamValue} }
    'weixin_messages.index': { paramsTuple: [ParamValue]; params: {'accountId': ParamValue} }
    'weixin_media_download.show': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'accountId': ParamValue,'messageId': ParamValue,'itemIndex': ParamValue} }
    'weixin_webhooks.index': { paramsTuple?: []; params?: {} }
    'weixin_webhooks.deliveries': { paramsTuple: [ParamValue]; params: {'webhookId': ParamValue} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'weixin_accounts.start': { paramsTuple: [ParamValue]; params: {'accountId': ParamValue} }
    'weixin_accounts.stop': { paramsTuple: [ParamValue]; params: {'accountId': ParamValue} }
    'weixin_login_sessions.store': { paramsTuple?: []; params?: {} }
    'weixin_login_sessions.verify': { paramsTuple: [ParamValue]; params: {'sessionId': ParamValue} }
    'weixin_messages.store': { paramsTuple: [ParamValue]; params: {'accountId': ParamValue} }
    'weixin_media.store': { paramsTuple: [ParamValue]; params: {'accountId': ParamValue} }
    'weixin_typing.store': { paramsTuple: [ParamValue]; params: {'accountId': ParamValue} }
    'weixin_webhooks.store': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'weixin_login_sessions.destroy': { paramsTuple: [ParamValue]; params: {'sessionId': ParamValue} }
    'weixin_webhooks.destroy': { paramsTuple: [ParamValue]; params: {'webhookId': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}
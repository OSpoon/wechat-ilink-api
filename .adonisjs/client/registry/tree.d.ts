/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  system: {
    index: typeof routes['system.index']
    live: typeof routes['system.live']
    ready: typeof routes['system.ready']
  }
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
    accessTokens: {
      destroy: typeof routes['profile.access_tokens.destroy']
    }
  }
  weixinAccounts: {
    index: typeof routes['weixin_accounts.index']
    show: typeof routes['weixin_accounts.show']
    start: typeof routes['weixin_accounts.start']
    stop: typeof routes['weixin_accounts.stop']
  }
  weixinLoginSessions: {
    store: typeof routes['weixin_login_sessions.store']
    show: typeof routes['weixin_login_sessions.show']
    verify: typeof routes['weixin_login_sessions.verify']
    destroy: typeof routes['weixin_login_sessions.destroy']
  }
  weixinMessages: {
    index: typeof routes['weixin_messages.index']
    store: typeof routes['weixin_messages.store']
  }
  weixinMediaDownload: {
    show: typeof routes['weixin_media_download.show']
  }
  weixinMedia: {
    store: typeof routes['weixin_media.store']
  }
  weixinTyping: {
    store: typeof routes['weixin_typing.store']
  }
  weixinWebhooks: {
    index: typeof routes['weixin_webhooks.index']
    store: typeof routes['weixin_webhooks.store']
    deliveries: typeof routes['weixin_webhooks.deliveries']
    destroy: typeof routes['weixin_webhooks.destroy']
  }
}

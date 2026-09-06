import { getToken, request } from './client'
import type {
  ApiResponse,
  AuthData,
  LoginSession,
  User,
  Webhook,
  WebhookDelivery,
  WeixinAccount,
  WeixinMessage,
} from '../types/api'

async function requestSystem<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { Accept: 'application/json' } })
  const body = (await response.json().catch(() => ({}))) as T & { error?: { message?: string } }
  if (!response.ok) throw new Error(body.error?.message || '服务不可用')
  return body
}

export const systemApi = {
  ready() {
    return requestSystem<{ status: string; database: string }>('/health/ready')
  },
}

export const authApi = {
  login(email: string, password: string) {
    return request<ApiResponse<AuthData>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
  profile() {
    return request<ApiResponse<User>>('/account/profile')
  },
  logout() {
    return request<{ message: string }>('/account/logout', { method: 'POST' })
  },
}

export const accountsApi = {
  list() {
    return request<ApiResponse<WeixinAccount[]>>('/weixin/accounts')
  },
  get(id: string) {
    return request<ApiResponse<WeixinAccount>>(`/weixin/accounts/${id}`)
  },
  start(id: string) {
    return request<ApiResponse<WeixinAccount>>(`/weixin/accounts/${id}/start`, { method: 'POST' })
  },
  stop(id: string) {
    return request<ApiResponse<WeixinAccount>>(`/weixin/accounts/${id}/stop`, { method: 'POST' })
  },
}

export const loginSessionsApi = {
  create() {
    return request<ApiResponse<LoginSession>>('/weixin/login-sessions', { method: 'POST' })
  },
  get(id: string) {
    return request<ApiResponse<LoginSession>>(`/weixin/login-sessions/${id}`)
  },
  verify(id: string, code: string) {
    return request<ApiResponse<LoginSession>>(`/weixin/login-sessions/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  },
  cancel(id: string) {
    return request<void>(`/weixin/login-sessions/${id}`, { method: 'DELETE' })
  },
}

export const messagesApi = {
  list(accountId: string, limit = 50) {
    return request<ApiResponse<WeixinMessage[]>>(
      `/weixin/accounts/${accountId}/messages?limit=${limit}`
    )
  },
  sendText(accountId: string, to: string, text: string) {
    return request<ApiResponse<{ id: string; clientMessageId: string; status: string }>>(
      `/weixin/accounts/${accountId}/messages`,
      { method: 'POST', body: JSON.stringify({ to, text }) }
    )
  },
  sendMedia(
    accountId: string,
    payload: { to: string; mediaType: 'image' | 'video' | 'file'; caption?: string; file: File }
  ) {
    const body = new FormData()
    body.append('to', payload.to)
    body.append('mediaType', payload.mediaType)
    if (payload.caption) body.append('caption', payload.caption)
    body.append('file', payload.file)
    return request<
      ApiResponse<{ id: string; clientMessageId: string; mediaType: string; status: string }>
    >(`/weixin/accounts/${accountId}/messages/media`, { method: 'POST', body })
  },
  typing(accountId: string, to: string, status: 1 | 2) {
    return request<ApiResponse<{ status: number }>>(`/weixin/accounts/${accountId}/typing`, {
      method: 'POST',
      body: JSON.stringify({ to, status }),
    })
  },
  async downloadMedia(accountId: string, messageId: string, itemIndex: number) {
    const headers = new Headers()
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    const response = await fetch(
      `/api/v1/weixin/accounts/${accountId}/messages/${messageId}/media/${itemIndex}`,
      { headers }
    )
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: { code?: string; message?: string }
        message?: string
      } | null
      const message = body?.error?.message || body?.message || '媒体下载失败，请稍后重试'
      throw new Error(body?.error?.code ? `${body.error.code}: ${message}` : message)
    }
    return await response.blob()
  },
}

export const webhooksApi = {
  list() {
    return request<ApiResponse<Webhook[]>>('/weixin/webhooks')
  },
  create(payload: { accountId: string; url: string; secret: string; events: string[] }) {
    return request<ApiResponse<Webhook>>('/weixin/webhooks', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  remove(id: string) {
    return request<void>(`/weixin/webhooks/${id}`, { method: 'DELETE' })
  },
  deliveries(id: string) {
    return request<ApiResponse<WebhookDelivery[]>>(`/weixin/webhooks/${id}/deliveries`)
  },
}

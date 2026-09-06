export type AccountStatus = 'stopped' | 'starting' | 'running' | 'reauth_required' | 'error'
export type LoginSessionStatus =
  | 'waiting_scan'
  | 'scanned'
  | 'need_verifycode'
  | 'verifying'
  | 'confirmed'
  | 'already_connected'
  | 'failed'
  | 'expired'
  | 'cancelled'
export type MessageDirection = 'inbound' | 'outbound'
export type MessageStatus = 'received' | 'sent' | 'failed'
export type WebhookDeliveryStatus = 'pending' | 'delivered' | 'failed'

export interface ApiResponse<T> {
  data: T
}

export interface ApiErrorBody {
  error?: {
    code?: string
    message?: string
  }
}

export interface User {
  id: number
  fullName: string | null
  email: string
  initials: string
  createdAt: string
  updatedAt: string
}

export interface AuthData {
  user: User
  token: string
}

export interface WeixinAccount {
  id: string
  providerAccountId: string
  ilinkUserId: string | null
  baseUrl: string
  cdnBaseUrl: string
  status: AccountStatus
  enabled: boolean
  lastError: string | null
  lastInboundAt: string | null
  lastOutboundAt: string | null
  createdAt: string
  updatedAt: string
}

export interface LoginSession {
  id: string
  status: LoginSessionStatus
  qrUrl?: string
  accountId: string | null
  ilinkUserId: string | null
  errorMessage: string | null
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface MediaReference {
  itemIndex: number
  url: string
}

export interface WeixinMessage {
  id: string
  direction: MessageDirection
  from: string | null
  to: string | null
  status: MessageStatus
  providerMessageId: string | null
  clientMessageId: string | null
  payload: Record<string, unknown>
  media: MediaReference[]
  receivedAt: string | null
  sentAt: string | null
  createdAt: string
}

export interface Webhook {
  id: string
  accountId: string
  url: string
  events: string[]
  enabled: boolean
  lastDeliveryAt: string | null
  createdAt: string
  updatedAt: string
}

export interface WebhookDelivery {
  id: string
  eventType: string
  eventId: string
  status: WebhookDeliveryStatus
  attempts: number
  lastError: string | null
  nextAttemptAt: string | null
  deliveredAt: string | null
  createdAt: string
  updatedAt: string
}

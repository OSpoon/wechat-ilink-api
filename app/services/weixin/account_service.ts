import { randomUUID } from 'node:crypto'
import env from '#start/env'
import type WeixinAccount from '#models/weixin_account'
import type { DateTime } from 'luxon'
import type { WeixinAccountStatus } from '#contracts/weixin'
import { decryptSecret, encryptSecret } from './secret_service.js'
import { DEFAULT_CDN_BASE_URL, DEFAULT_ILINK_BASE_URL } from './ilink_client.js'

export type PublicWeixinAccount = {
  id: string
  providerAccountId: string
  ilinkUserId: string | null
  baseUrl: string
  cdnBaseUrl: string
  status: WeixinAccountStatus
  enabled: boolean
  lastError: string | null
  lastInboundAt: DateTime | null
  lastOutboundAt: DateTime | null
  createdAt: DateTime
  updatedAt: DateTime
}

async function getWeixinAccountModel() {
  const model = await import('#models/weixin_account')
  return model.default
}

export function toPublicAccount(account: WeixinAccount): PublicWeixinAccount {
  return {
    id: account.id,
    providerAccountId: account.providerAccountId,
    ilinkUserId: account.ilinkUserId,
    baseUrl: account.baseUrl,
    cdnBaseUrl: account.cdnBaseUrl,
    status: account.status,
    enabled: account.enabled,
    lastError: account.lastError,
    lastInboundAt: account.lastInboundAt,
    lastOutboundAt: account.lastOutboundAt,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  }
}

export async function listAccounts(userId: number) {
  const WeixinAccount = await getWeixinAccountModel()
  const accounts = await WeixinAccount.query()
    .where('user_id', userId)
    .orderBy('created_at', 'desc')
  return accounts.map(toPublicAccount)
}

export async function findAccount(userId: number, accountId: string) {
  const WeixinAccount = await getWeixinAccountModel()
  return WeixinAccount.query().where('id', accountId).where('user_id', userId).first()
}

export async function findAccountOrFail(userId: number, accountId: string) {
  const account = await findAccount(userId, accountId)
  if (!account) {
    const error = new Error('Weixin account not found')
    Object.assign(error, { status: 404, code: 'WEIXIN_ACCOUNT_NOT_FOUND' })
    throw error
  }
  return account
}

export function accountToken(account: WeixinAccount) {
  return decryptSecret(account.encryptedBotToken)
}

export async function saveConfirmedAccount(params: {
  userId: number
  providerAccountId: string
  ilinkUserId?: string
  botToken: string
  baseUrl?: string
}) {
  const WeixinAccount = await getWeixinAccountModel()
  let account = await WeixinAccount.query()
    .where('user_id', params.userId)
    .where('provider_account_id', params.providerAccountId)
    .first()

  const values = {
    ilinkUserId: params.ilinkUserId ?? null,
    encryptedBotToken: encryptSecret(params.botToken.trim()),
    baseUrl: params.baseUrl?.trim() || env.get('ILINK_BASE_URL', DEFAULT_ILINK_BASE_URL),
    cdnBaseUrl: env.get('ILINK_CDN_BASE_URL', DEFAULT_CDN_BASE_URL),
    status: 'stopped' as const,
    enabled: true,
    lastError: null,
  }

  if (account) {
    account.merge(values)
    await account.save()
    return account
  }

  account = await WeixinAccount.create({
    id: `wxacc_${randomUUID()}`,
    userId: params.userId,
    providerAccountId: params.providerAccountId,
    ...values,
  })
  return account
}

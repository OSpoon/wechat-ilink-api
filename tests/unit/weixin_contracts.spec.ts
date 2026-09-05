import { test } from '@japa/runner'
import {
  ILinkMessageItemType,
  ILinkMessageState,
  ILinkMessageType,
  iLinkQrStatuses,
  weixinAccountStatuses,
  weixinLoginSessionStatuses,
  weixinMessageDirections,
  weixinMessageStatuses,
  weixinTypingStatuses,
  weixinWebhookDeliveryStatuses,
  weixinWebhookEvents,
} from '#contracts/weixin'

test('public API status enums remain finite and documented', ({ assert }) => {
  assert.deepEqual(weixinLoginSessionStatuses, [
    'waiting_scan',
    'scanned',
    'need_verifycode',
    'verifying',
    'confirmed',
    'already_connected',
    'failed',
    'expired',
    'cancelled',
  ])
  assert.deepEqual(weixinAccountStatuses, [
    'stopped',
    'starting',
    'running',
    'reauth_required',
    'error',
  ])
  assert.deepEqual(weixinMessageDirections, ['inbound', 'outbound'])
  assert.deepEqual(weixinMessageStatuses, ['received', 'sent', 'failed'])
  assert.deepEqual(weixinWebhookDeliveryStatuses, ['pending', 'delivered', 'failed'])
  assert.deepEqual(weixinWebhookEvents, ['message.received'])
  assert.deepEqual(weixinTypingStatuses, [1, 2])
})

test('iLink protocol numeric constants match the upstream message contract', ({ assert }) => {
  assert.deepEqual(ILinkMessageType, { NONE: 0, USER: 1, BOT: 2 })
  assert.deepEqual(ILinkMessageState, { NEW: 0, GENERATING: 1, FINISH: 2 })
  assert.deepEqual(ILinkMessageItemType, {
    NONE: 0,
    TEXT: 1,
    IMAGE: 2,
    VOICE: 3,
    FILE: 4,
    VIDEO: 5,
    TOOL_CALL_START: 11,
    TOOL_CALL_RESULT: 12,
  })
  assert.deepEqual(iLinkQrStatuses, [
    'wait',
    'scaned',
    'confirmed',
    'expired',
    'scaned_but_redirect',
    'need_verifycode',
    'verify_code_blocked',
    'binded_redirect',
  ])
})

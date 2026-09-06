<script setup lang="ts">
import { computed } from 'vue'
import { ElTag } from 'element-plus'
import type {
  AccountStatus,
  LoginSessionStatus,
  MessageStatus,
  WebhookDeliveryStatus,
} from '../types/api'

const props = defineProps<{
  status:
    | AccountStatus
    | LoginSessionStatus
    | MessageStatus
    | WebhookDeliveryStatus
    | boolean
    | 0
    | 1
    | '0'
    | '1'
}>()

const statusMap: Record<
  string,
  { label: string; type: 'success' | 'info' | 'warning' | 'danger' }
> = {
  running: { label: '运行中', type: 'success' },
  starting: { label: '启动中', type: 'warning' },
  stopped: { label: '已停止', type: 'info' },
  reauth_required: { label: '需要重新登录', type: 'danger' },
  error: { label: '异常', type: 'danger' },
  waiting_scan: { label: '等待扫码', type: 'warning' },
  scanned: { label: '已扫码', type: 'warning' },
  need_verifycode: { label: '需要验证码', type: 'warning' },
  verifying: { label: '验证中', type: 'warning' },
  confirmed: { label: '登录成功', type: 'success' },
  already_connected: { label: '已连接', type: 'success' },
  failed: { label: '失败', type: 'danger' },
  expired: { label: '已过期', type: 'info' },
  cancelled: { label: '已取消', type: 'info' },
  received: { label: '已收到', type: 'success' },
  sent: { label: '已发送', type: 'success' },
  pending: { label: '投递中', type: 'warning' },
  delivered: { label: '已投递', type: 'success' },
  true: { label: '已启用', type: 'success' },
  false: { label: '已停用', type: 'info' },
}

const normalizedStatus = computed(() => {
  if (props.status === true || props.status === 1 || props.status === '1') return 'true'
  if (props.status === false || props.status === 0 || props.status === '0') return 'false'
  return String(props.status)
})

const display = computed(
  () =>
    statusMap[normalizedStatus.value] || {
      label: normalizedStatus.value,
      type: 'info' as const,
    }
)
</script>

<template>
  <ElTag :type="display.type" effect="light" round>{{ display.label }}</ElTag>
</template>

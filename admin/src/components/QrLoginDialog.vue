<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { loginSessionsApi } from '../api/resources'
import { ApiError } from '../api/client'
import type { LoginSession } from '../types/api'
import StatusTag from './StatusTag.vue'

const emit = defineEmits<{ completed: [] }>()
const visible = defineModel<boolean>({ default: false })
const session = ref<LoginSession | null>(null)
const verifyCode = ref('')
const loading = ref(false)
let timer: number | undefined

const isTerminal = computed(() =>
  ['confirmed', 'already_connected', 'failed', 'expired', 'cancelled'].includes(
    session.value?.status || ''
  )
)

function stopPolling() {
  if (timer) window.clearInterval(timer)
  timer = undefined
}

async function refresh() {
  if (!session.value) return
  try {
    session.value = (await loginSessionsApi.get(session.value.id)).data
    if (session.value.status === 'confirmed' || session.value.status === 'already_connected') {
      emit('completed')
    }
    if (isTerminal.value) stopPolling()
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) stopPolling()
  }
}

async function open() {
  visible.value = true
  session.value = null
  verifyCode.value = ''
  loading.value = true
  try {
    session.value = (await loginSessionsApi.create()).data
    timer = window.setInterval(refresh, 1000)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '二维码创建失败')
    visible.value = false
  } finally {
    loading.value = false
  }
}

async function submitCode() {
  if (!session.value || !verifyCode.value) return
  loading.value = true
  try {
    session.value = (await loginSessionsApi.verify(session.value.id, verifyCode.value)).data
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '验证码提交失败')
  } finally {
    loading.value = false
  }
}

async function cancel() {
  if (session.value && !isTerminal.value) {
    await loginSessionsApi.cancel(session.value.id).catch(() => undefined)
  }
  stopPolling()
  visible.value = false
}

function handleClosed() {
  stopPolling()
  session.value = null
}

defineExpose({ open })
onBeforeUnmount(stopPolling)
</script>

<template>
  <ElDialog v-model="visible" title="绑定微信账号" width="440px" @closed="handleClosed">
    <div v-loading="loading" class="qr-dialog-content">
      <template v-if="session">
        <StatusTag :status="session.status" />
        <p class="qr-title">
          {{
            session.status === 'need_verifycode'
              ? '请输入微信上显示的验证码'
              : '请使用微信扫描二维码'
          }}
        </p>
        <img
          v-if="session.qrUrl && !isTerminal"
          class="qr-image"
          :src="session.qrUrl"
          alt="微信登录二维码"
        />
        <div v-if="session.status === 'need_verifycode'" class="verify-row">
          <ElInput
            v-model="verifyCode"
            placeholder="请输入数字验证码"
            maxlength="8"
            @keyup.enter="submitCode"
          />
          <ElButton type="primary" :loading="loading" @click="submitCode">提交</ElButton>
        </div>
        <p v-if="session.errorMessage" class="error-copy">{{ session.errorMessage }}</p>
        <p v-if="!isTerminal" class="muted-copy">
          页面会自动更新登录状态，二维码有效期以微信页面为准。
        </p>
        <ElResult
          v-else-if="session.status === 'confirmed' || session.status === 'already_connected'"
          icon="success"
          title="微信账号绑定成功"
          sub-title="账号已经加入管理控制台。"
        />
        <ElResult v-else icon="error" title="登录未完成" sub-title="请关闭窗口后重新发起扫码。" />
      </template>
      <ElEmpty v-else description="正在生成二维码…" />
    </div>
    <template #footer>
      <ElButton @click="cancel">{{ isTerminal ? '关闭' : '取消登录' }}</ElButton>
    </template>
  </ElDialog>
</template>

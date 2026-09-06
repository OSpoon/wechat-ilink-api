<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Link, Refresh } from '@element-plus/icons-vue'
import { ApiError } from '../api/client'
import { loginSessionsApi } from '../api/resources'
import PageHeader from '../components/PageHeader.vue'
import StatusTag from '../components/StatusTag.vue'
import type { LoginSession } from '../types/api'

const router = useRouter()
const queryClient = useQueryClient()
const session = ref<LoginSession | null>(null)
const verifyCode = ref('')
const loading = ref(false)
let timer: number | undefined
const bindSessionStorageKey = 'wechat-ilink:bind-session-id'

const isTerminal = computed(() =>
  ['confirmed', 'already_connected', 'failed', 'expired', 'cancelled'].includes(
    session.value?.status || ''
  )
)
const qrLink = computed(() => session.value?.qrUrl || '')

function stopPolling() {
  if (timer) window.clearInterval(timer)
  timer = undefined
}

async function refresh() {
  if (!session.value) return
  try {
    session.value = (await loginSessionsApi.get(session.value.id)).data
    if (session.value.status === 'confirmed' || session.value.status === 'already_connected') {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    }
    if (isTerminal.value) {
      sessionStorage.removeItem(bindSessionStorageKey)
      stopPolling()
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) stopPolling()
  }
}

async function createSession() {
  stopPolling()
  session.value = null
  verifyCode.value = ''
  loading.value = true
  try {
    session.value = (await loginSessionsApi.create()).data
    sessionStorage.setItem(bindSessionStorageKey, session.value.id)
    openQrLink()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '二维码创建失败')
  } finally {
    loading.value = false
  }
}

function openQrLink() {
  if (!qrLink.value) return
  window.location.assign(qrLink.value)
}

async function restoreSession() {
  const sessionId = sessionStorage.getItem(bindSessionStorageKey)
  if (!sessionId) {
    await createSession()
    return
  }

  loading.value = true
  try {
    session.value = (await loginSessionsApi.get(sessionId)).data
    if (session.value.status === 'confirmed' || session.value.status === 'already_connected') {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    }
    if (isTerminal.value) sessionStorage.removeItem(bindSessionStorageKey)
    else {
      openQrLink()
      timer = window.setInterval(refresh, 1000)
    }
  } catch {
    sessionStorage.removeItem(bindSessionStorageKey)
    await createSession()
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

async function leave() {
  if (session.value && !isTerminal.value) {
    await loginSessionsApi.cancel(session.value.id).catch(() => undefined)
  }
  stopPolling()
  sessionStorage.removeItem(bindSessionStorageKey)
  router.push('/accounts')
}

onMounted(restoreSession)
onBeforeUnmount(stopPolling)
</script>

<template>
  <PageHeader
    title="绑定微信账号"
    description="使用微信扫描二维码，将新的微信连接加入当前 API 用户。"
  >
    <template #actions>
      <ElButton :icon="ArrowLeft" @click="leave">返回账号列表</ElButton>
      <ElButton :icon="Refresh" :loading="loading" @click="createSession">重新生成</ElButton>
    </template>
  </PageHeader>

  <ElCard class="panel-card bind-card" shadow="never">
    <div v-loading="loading" class="bind-content">
      <template v-if="session">
        <StatusTag :status="session.status" />
        <h2 class="qr-page-title">
          {{
            session.status === 'need_verifycode'
              ? '请输入微信上显示的验证码'
              : '请使用微信扫描二维码'
          }}
        </h2>
        <p class="qr-page-subtitle">二维码有效期以微信页面为准，页面会自动更新登录状态。</p>
        <div v-if="!isTerminal && qrLink" class="qr-link-panel">
          <div class="qr-link-icon">
            <ElIcon><Link /></ElIcon>
          </div>
          <strong>正在打开微信扫码页面</strong>
          <p>微信提供的登录链接会在当前页面打开。完成扫码后返回此页面查看绑定结果。</p>
          <div class="qr-link-value">{{ qrLink }}</div>
        </div>
        <ElEmpty v-else-if="!isTerminal" description="正在准备二维码地址…" />
        <div v-if="session.status === 'need_verifycode'" class="verify-row verify-row-page">
          <ElInput
            v-model="verifyCode"
            placeholder="请输入数字验证码"
            maxlength="8"
            @keyup.enter="submitCode"
          />
          <ElButton type="primary" :loading="loading" @click="submitCode">提交</ElButton>
        </div>
        <p v-if="session.errorMessage" class="error-copy">{{ session.errorMessage }}</p>
        <ElResult
          v-if="session.status === 'confirmed' || session.status === 'already_connected'"
          icon="success"
          title="微信账号绑定成功"
          sub-title="账号已经加入管理控制台。"
        />
        <ElResult
          v-else-if="isTerminal"
          icon="error"
          title="登录未完成"
          sub-title="请重新生成二维码后再次尝试。"
        />
      </template>
      <ElEmpty v-else description="正在创建登录会话…" />
    </div>
    <div
      v-if="session?.status === 'confirmed' || session?.status === 'already_connected'"
      class="bind-footer"
    >
      <ElButton type="primary" @click="router.push('/accounts')">查看微信账号</ElButton>
    </div>
  </ElCard>
</template>

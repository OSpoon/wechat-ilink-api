<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ChatDotRound, CircleCheck, Connection, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const form = reactive({ email: '', password: '' })

async function submit() {
  if (!form.email || !form.password) {
    ElMessage.warning('请输入邮箱和密码')
    return
  }
  loading.value = true
  try {
    await auth.login(form.email, form.password)
    router.push('/dashboard')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <section class="auth-visual">
      <div class="auth-visual-inner">
        <div class="brand brand-auth">
          <div class="brand-mark">
            <ElIcon><ChatDotRound /></ElIcon>
          </div>
          <div><strong>微信 iLink</strong><span>管理控制台</span></div>
        </div>
        <div class="auth-kicker">Ilink operations</div>
        <h2>让每个微信连接都清晰可控。</h2>
        <p class="auth-visual-copy">
          集中管理账号连接、消息活动和 Webhook 投递，把日常运维变成一眼可读的工作流。
        </p>
        <ul class="auth-points">
          <li>
            <ElIcon><CircleCheck /></ElIcon>实时掌握账号健康状态
          </li>
          <li>
            <ElIcon><Connection /></ElIcon>统一管理入站消息回调
          </li>
          <li>
            <ElIcon><Lock /></ElIcon>敏感凭据由服务端安全保存
          </li>
        </ul>
        <div class="auth-copyright">WECHAT ILINK · PRIVATE OPERATIONS CONSOLE</div>
      </div>
    </section>
    <section class="auth-form-side">
      <div class="auth-card">
        <div class="mobile-brand brand brand-auth">
          <div class="brand-mark">
            <ElIcon><ChatDotRound /></ElIcon>
          </div>
          <div><strong>微信 iLink</strong><span>管理控制台</span></div>
        </div>
        <div class="auth-heading">
          <h1>欢迎回来</h1>
          <p>登录后管理微信账号和消息连接。</p>
        </div>
        <ElForm label-position="top" @submit.prevent="submit">
          <ElFormItem label="邮箱"
            ><ElInput v-model="form.email" type="email" placeholder="name@example.com" size="large"
          /></ElFormItem>
          <ElFormItem label="密码"
            ><ElInput
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              @keyup.enter="submit"
          /></ElFormItem>
          <ElButton
            class="auth-submit"
            type="primary"
            size="large"
            :loading="loading"
            @click="submit"
            >登录控制台</ElButton
          >
        </ElForm>
        <p class="auth-footnote">API 用户凭据用于访问当前服务中的微信资源。</p>
      </div>
    </section>
  </div>
</template>

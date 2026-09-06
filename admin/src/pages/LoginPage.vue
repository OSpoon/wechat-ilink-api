<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ChatDotRound } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const form = reactive({ email: '', password: '' })
const activeFeature = ref(0)
const focusedField = ref<'email' | 'password' | null>(null)
let featureTimer: number | undefined

const features = [
  {
    label: '连接状态',
    eyebrow: '01 / CONNECTIONS',
    title: '一眼掌握连接状态',
    copy: '从扫码绑定到持续运行，让每个微信连接都保持可见。',
    metric: '03',
    metricLabel: '活跃连接',
    rows: [
      { name: '客服账号 · 上海', meta: '最近同步 12 秒前', status: '运行中', tone: 'success' },
      { name: '运营账号 · 深圳', meta: '最近同步 2 分钟前', status: '运行中', tone: 'success' },
      { name: '测试账号 · Dev', meta: '需要重新登录', status: '待处理', tone: 'warning' },
    ],
  },
  {
    label: '消息活动',
    eyebrow: '02 / MESSAGE FLOW',
    title: '消息流清晰可追踪',
    copy: '在同一个工作台里查看入站消息、发送测试内容和媒体记录。',
    metric: '128',
    metricLabel: '今日消息',
    rows: [
      { name: '收到文本消息', meta: '来自 user_8f2a · 刚刚', status: '已收到', tone: 'success' },
      { name: '发送测试消息', meta: '发送给 user_91ca · 1 分钟前', status: '已发送', tone: 'info' },
      { name: '媒体消息', meta: '图片 · 2 分钟前', status: '已收到', tone: 'success' },
    ],
  },
  {
    label: 'Webhook',
    eyebrow: '03 / DELIVERY HEALTH',
    title: '每一次投递都有回音',
    copy: '快速发现失败投递，把排查路径从猜测变成清晰的操作。',
    metric: '99.8%',
    metricLabel: '投递成功率',
    rows: [
      {
        name: 'message.received',
        meta: 'https://api.example.com/hooks',
        status: '已投递',
        tone: 'success',
      },
      {
        name: 'message.received',
        meta: 'https://api.example.com/hooks',
        status: '已投递',
        tone: 'success',
      },
      { name: 'message.received', meta: '最近失败 8 分钟前', status: '需检查', tone: 'warning' },
    ],
  },
]

const currentFeature = computed(() => features[activeFeature.value])

function selectFeature(index: number) {
  activeFeature.value = index
}

function startFeatureRotation() {
  featureTimer = window.setInterval(() => {
    activeFeature.value = (activeFeature.value + 1) % features.length
  }, 5200)
}

onMounted(startFeatureRotation)
onBeforeUnmount(() => {
  if (featureTimer) window.clearInterval(featureTimer)
})

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
        <h2>让微信连接都清晰可控。</h2>
        <p class="auth-visual-copy">
          集中管理账号连接、消息活动和 Webhook 投递，把日常运维变成一眼可读的工作流。
        </p>
        <div class="auth-feature-tabs" role="tablist" aria-label="产品能力预览">
          <button
            v-for="(feature, index) in features"
            :key="feature.label"
            type="button"
            class="auth-feature-tab"
            :class="{ active: activeFeature === index }"
            role="tab"
            :aria-selected="activeFeature === index"
            @click="selectFeature(index)"
          >
            <span class="auth-feature-index">0{{ index + 1 }}</span
            >{{ feature.label }}
          </button>
        </div>
        <div class="auth-preview" :key="activeFeature">
          <div class="auth-preview-topline">
            <span>{{ currentFeature.eyebrow }}</span>
            <span class="auth-preview-live"><i />LIVE</span>
          </div>
          <div class="auth-preview-heading">
            <div>
              <h3>{{ currentFeature.title }}</h3>
              <p>{{ currentFeature.copy }}</p>
            </div>
            <div class="auth-preview-metric">
              <strong>{{ currentFeature.metric }}</strong>
              <span>{{ currentFeature.metricLabel }}</span>
            </div>
          </div>
          <div class="auth-preview-list">
            <div
              v-for="row in currentFeature.rows.slice(0, 2)"
              :key="`${row.name}-${row.meta}`"
              class="auth-preview-row"
            >
              <span class="auth-preview-dot" :class="row.tone" />
              <div>
                <strong>{{ row.name }}</strong>
                <span>{{ row.meta }}</span>
              </div>
              <em :class="row.tone">{{ row.status }}</em>
            </div>
          </div>
        </div>
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
            ><ElInput
              v-model="form.email"
              type="email"
              placeholder="name@example.com"
              size="large"
              @focus="focusedField = 'email'"
              @blur="focusedField = null"
          /></ElFormItem>
          <ElFormItem label="密码"
            ><ElInput
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              @focus="focusedField = 'password'"
              @blur="focusedField = null"
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
        <p class="auth-footnote">
          {{
            focusedField === 'password'
              ? '凭据仅用于访问当前服务中的微信资源。'
              : 'API 用户凭据用于访问当前服务中的微信资源。'
          }}
        </p>
      </div>
    </section>
  </div>
</template>

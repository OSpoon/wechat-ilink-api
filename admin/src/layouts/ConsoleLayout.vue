<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound,
  CircleCheckFilled,
  Connection,
  Expand,
  Fold,
  House,
  SwitchButton,
  UserFilled,
} from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import { systemApi } from '../api/resources'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const collapsed = ref(false)
const healthQuery = useQuery({
  queryKey: ['system-health'],
  queryFn: () => systemApi.ready(),
  refetchInterval: 15000,
})
const serviceOnline = computed(
  () => healthQuery.data.value?.status === 'ok' && healthQuery.data.value?.database === 'ok'
)
const serviceLabel = computed(() => {
  if (healthQuery.isPending.value) return '检查中'
  return serviceOnline.value ? '服务正常' : '服务异常'
})

const navItems = [
  { path: '/dashboard', label: '仪表盘', icon: House },
  { path: '/accounts', label: '微信账号', icon: UserFilled },
  { path: '/webhooks', label: 'Webhook', icon: Connection },
]

function toggleSidebar() {
  collapsed.value = !collapsed.value
  localStorage.setItem('wechat-ilink:sidebar-collapsed', String(collapsed.value))
}

onMounted(() => {
  const saved = localStorage.getItem('wechat-ilink:sidebar-collapsed')
  collapsed.value = saved === null ? window.innerWidth <= 980 : saved === 'true'
})

async function logout() {
  await auth.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<template>
  <div class="console-shell" :class="{ 'sidebar-collapsed': collapsed }">
    <aside class="sidebar">
      <div class="sidebar-head">
        <div class="brand">
          <div class="brand-mark">
            <ElIcon><ChatDotRound /></ElIcon>
          </div>
          <div>
            <strong>微信 iLink</strong>
            <span>管理控制台</span>
          </div>
        </div>
        <ElButton
          text
          class="sidebar-toggle"
          :icon="collapsed ? Expand : Fold"
          :aria-label="collapsed ? '展开导航' : '收起导航'"
          :title="collapsed ? '展开导航' : '收起导航'"
          @click="toggleSidebar"
        />
      </div>
      <div class="nav-label">工作台</div>
      <nav class="main-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path.startsWith(item.path) }"
        >
          <ElIcon><component :is="item.icon" /></ElIcon>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
      <div class="sidebar-foot">
        <ElIcon><CircleCheckFilled /></ElIcon><span>API v1</span>
      </div>
    </aside>

    <section class="main-area">
      <header class="topbar">
        <div class="topbar-context">
          <span>管理控制台</span>
          <ElIcon><span>/</span></ElIcon>
          <span>{{
            navItems.find((item) => route.path.startsWith(item.path))?.label || '管理控制台'
          }}</span>
          <span
            class="system-chip"
            :class="{
              danger: healthQuery.isError.value || (!!healthQuery.data.value && !serviceOnline),
            }"
            ><ElIcon><CircleCheckFilled /></ElIcon>{{ serviceLabel }}</span
          >
        </div>
        <div class="topbar-user">
          <div class="avatar">{{ auth.user?.initials || 'U' }}</div>
          <div class="user-copy">
            <strong>{{ auth.user?.fullName || 'API 用户' }}</strong
            ><span>{{ auth.user?.email }}</span>
          </div>
          <ElButton text :icon="SwitchButton" aria-label="退出登录" @click="logout" />
        </div>
      </header>
      <main class="page-content"><RouterView /></main>
    </section>
  </div>
</template>

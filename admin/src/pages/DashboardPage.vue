<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { Refresh, Plus, ArrowRight } from '@element-plus/icons-vue'
import { accountsApi, webhooksApi } from '../api/resources'
import PageHeader from '../components/PageHeader.vue'
import MetricCard from '../components/MetricCard.vue'
import StatusTag from '../components/StatusTag.vue'
import type { WeixinAccount } from '../types/api'

const router = useRouter()
const accountsQuery = useQuery({
  queryKey: ['accounts'],
  queryFn: async () => (await accountsApi.list()).data,
})
const webhooksQuery = useQuery({
  queryKey: ['webhooks'],
  queryFn: async () => (await webhooksApi.list()).data,
})
const accounts = computed(() => accountsQuery.data.value || [])
const runningCount = computed(
  () => accounts.value.filter((account) => account.status === 'running').length
)
const attentionCount = computed(
  () =>
    accounts.value.filter((account) => ['reauth_required', 'error'].includes(account.status)).length
)
const latestAccount = computed(
  () => [...accounts.value].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))[0]
)

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '暂无记录'
}

function accountSummary(account: WeixinAccount) {
  return account.ilinkUserId || account.providerAccountId || account.id
}
</script>

<template>
  <PageHeader title="仪表盘" description="快速了解微信连接和 Webhook 的整体运行状态。">
    <template #actions
      ><ElButton
        :icon="Refresh"
        :loading="accountsQuery.isFetching.value || webhooksQuery.isFetching.value"
        @click="
          () => {
            accountsQuery.refetch()
            webhooksQuery.refetch()
          }
        "
        >刷新</ElButton
      ><ElButton type="primary" :icon="Plus" @click="router.push('/accounts')"
        >绑定微信</ElButton
      ></template
    >
  </PageHeader>

  <div class="metric-grid">
    <MetricCard label="微信账号" :value="accounts.length" hint="当前已绑定的账号" tone="blue" />
    <MetricCard label="运行中" :value="runningCount" hint="连接正常的账号" tone="green" />
    <MetricCard label="需要关注" :value="attentionCount" hint="异常或需要重新登录" tone="orange" />
    <MetricCard
      label="Webhook"
      :value="webhooksQuery.data.value?.length || 0"
      hint="已配置的投递端点"
      tone="purple"
    />
  </div>

  <div class="dashboard-grid">
    <ElCard class="panel-card" shadow="never">
      <template #header
        ><div class="card-header">
          <div>
            <h2>账号状态</h2>
            <p>最近更新的微信连接</p>
          </div>
          <RouterLink to="/accounts" class="text-link"
            >查看全部 <ElIcon><ArrowRight /></ElIcon
          ></RouterLink></div
      ></template>
      <div v-if="accountsQuery.isPending.value" class="skeleton-stack">
        <ElSkeleton v-for="i in 3" :key="i" animated />
      </div>
      <ElEmpty v-else-if="!accounts.length" description="还没有绑定微信账号" />
      <div v-else class="account-list">
        <div
          v-for="account in accounts.slice(0, 5)"
          :key="account.id"
          class="account-row"
          @click="router.push(`/accounts/${account.id}`)"
        >
          <div class="account-icon">微</div>
          <div class="account-main">
            <strong>{{ accountSummary(account) }}</strong
            ><span>{{ account.id }}</span>
          </div>
          <StatusTag :status="account.status" /><span class="row-date">{{
            formatDate(account.updatedAt)
          }}</span>
        </div>
      </div>
    </ElCard>

    <ElCard class="panel-card" shadow="never">
      <template #header
        ><div class="card-header">
          <div>
            <h2>最近活动</h2>
            <p>账号最近一次状态更新时间</p>
          </div>
        </div></template
      >
      <div class="activity-highlight">
        <div class="activity-dot" :class="{ danger: latestAccount && attentionCount > 0 }" />
        <div>
          <strong>{{ latestAccount ? '账号状态已同步' : '等待首次绑定' }}</strong>
          <p>
            {{
              latestAccount
                ? `${accountSummary(latestAccount)} · ${formatDate(latestAccount.updatedAt)}`
                : '绑定微信后这里会显示最近活动'
            }}
          </p>
        </div>
      </div>
      <div class="quick-links">
        <RouterLink to="/webhooks"
          ><span>检查 Webhook 投递</span><ElIcon><ArrowRight /></ElIcon></RouterLink
        ><RouterLink to="/accounts"
          ><span>管理微信账号</span><ElIcon><ArrowRight /></ElIcon
        ></RouterLink>
      </div>
    </ElCard>
  </div>
</template>

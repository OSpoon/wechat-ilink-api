<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, View, VideoPlay, VideoPause } from '@element-plus/icons-vue'
import { accountsApi } from '../api/resources'
import PageHeader from '../components/PageHeader.vue'
import StatusTag from '../components/StatusTag.vue'
import type { WeixinAccount } from '../types/api'

const router = useRouter()
const queryClient = useQueryClient()
const filter = ref('')
const query = useQuery({
  queryKey: ['accounts'],
  queryFn: async () => (await accountsApi.list()).data,
})
const action = useMutation({
  mutationFn: ({ id, operation }: { id: string; operation: 'start' | 'stop' }) =>
    operation === 'start' ? accountsApi.start(id) : accountsApi.stop(id),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
})
const allAccounts = computed(() => query.data.value || [])
const accounts = computed(() =>
  allAccounts.value.filter((account) => {
    const text =
      `${account.id} ${account.providerAccountId} ${account.ilinkUserId || ''}`.toLowerCase()
    return text.includes(filter.value.toLowerCase())
  })
)

function shortId(value: string | null) {
  return value ? `${value.slice(0, 18)}${value.length > 18 ? '…' : ''}` : '未返回'
}
function date(value: string | null) {
  return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '—'
}
function openAccount(row: WeixinAccount) {
  router.push(`/accounts/${row.id}`)
}

function openBindPage() {
  router.push('/accounts/bind')
}

async function toggle(account: (typeof accounts.value)[number]) {
  const operation = account.status === 'running' ? 'stop' : 'start'
  if (operation === 'stop')
    await ElMessageBox.confirm('停止后将不再持续接收该账号的新消息，确定继续吗？', '停止微信账号', {
      type: 'warning',
    })
  try {
    await action.mutateAsync({ id: account.id, operation })
    ElMessage.success(operation === 'start' ? '账号启动请求已提交' : '账号已停止')
  } catch (error) {
    if (error !== 'cancel') ElMessage.error(error instanceof Error ? error.message : '操作失败')
  }
}
</script>

<template>
  <PageHeader title="微信账号" description="绑定、查看并控制当前 API 用户下的微信连接。">
    <template #actions
      ><ElButton :icon="Refresh" :loading="query.isFetching.value" @click="query.refetch"
        >刷新</ElButton
      ><ElButton type="primary" :icon="Plus" @click="openBindPage"
        >绑定微信账号</ElButton
      ></template
    >
  </PageHeader>
  <ElCard class="panel-card" shadow="never">
    <div class="toolbar">
      <ElInput
        v-model="filter"
        clearable
        placeholder="搜索账号 ID 或微信用户 ID"
        class="search-input"
      /><span class="toolbar-count">共 {{ accounts.length }} 个账号</span>
    </div>
    <ElTable
      v-if="query.isPending.value || allAccounts.length || filter"
      v-loading="query.isPending.value"
      :data="accounts"
      empty-text=""
      row-class-name="clickable-row"
      @row-click="openAccount"
    >
      <ElTableColumn label="账号" min-width="270"
        ><template #default="{ row }"
          ><div class="table-account">
            <div class="account-icon">微</div>
            <div>
              <strong>{{ shortId(row.ilinkUserId || row.providerAccountId) }}</strong
              ><span>{{ row.id }}</span>
            </div>
          </div></template
        ></ElTableColumn
      ><template #empty
        ><ElEmpty
          v-if="!query.isPending.value"
          :description="filter ? '没有匹配的微信账号' : '还没有绑定微信账号'"
      /></template>
      <ElTableColumn label="状态" width="150"
        ><template #default="{ row }"><StatusTag :status="row.status" /></template
      ></ElTableColumn>
      <ElTableColumn label="最近收到" min-width="180"
        ><template #default="{ row }">{{ date(row.lastInboundAt) }}</template></ElTableColumn
      >
      <ElTableColumn label="最近发送" min-width="180"
        ><template #default="{ row }">{{ date(row.lastOutboundAt) }}</template></ElTableColumn
      >
      <ElTableColumn label="操作" width="250" fixed="right"
        ><template #default="{ row }"
          ><ElButton
            link
            type="primary"
            :icon="View"
            @click.stop="router.push(`/accounts/${row.id}`)"
            >详情</ElButton
          ><ElButton
            v-if="row.status === 'running'"
            link
            type="warning"
            :icon="VideoPause"
            :loading="action.isPending.value"
            @click.stop="toggle(row)"
            >停止</ElButton
          ><ElButton
            v-else
            link
            type="success"
            :icon="VideoPlay"
            :loading="action.isPending.value"
            @click.stop="toggle(row)"
            >启动</ElButton
          ></template
        ></ElTableColumn
      >
    </ElTable>
    <ElEmpty
      v-if="!query.isPending.value && !allAccounts.length && !filter"
      description="还没有绑定微信账号"
    />
  </ElCard>
</template>

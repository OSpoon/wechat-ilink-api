<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Refresh } from '@element-plus/icons-vue'
import { webhooksApi } from '../api/resources'
import PageHeader from '../components/PageHeader.vue'
import StatusTag from '../components/StatusTag.vue'

const route = useRoute()
const router = useRouter()
const id = String(route.params.id)
const query = useQuery({
  queryKey: ['webhook-deliveries', id],
  queryFn: async () => (await webhooksApi.deliveries(id)).data,
})
function date(value: string | null) {
  return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '—'
}
</script>

<template>
  <PageHeader title="Webhook 投递记录" description="查看最近 100 条投递的状态和错误信息。"
    ><template #actions
      ><ElButton :icon="ArrowLeft" @click="router.push('/webhooks')">返回 Webhook</ElButton
      ><ElButton :icon="Refresh" :loading="query.isFetching.value" @click="query.refetch"
        >刷新</ElButton
      ></template
    ></PageHeader
  >
  <ElCard class="panel-card" shadow="never"
    ><ElTable
      v-if="query.isPending.value || query.data.value?.length"
      v-loading="query.isPending.value"
      :data="query.data.value || []"
      ><ElTableColumn label="投递 ID" prop="id" min-width="230" /><ElTableColumn
        label="事件"
        prop="eventType"
        width="180"
      /><ElTableColumn label="状态" width="120"
        ><template #default="{ row }"><StatusTag :status="row.status" /></template></ElTableColumn
      ><ElTableColumn label="尝试次数" prop="attempts" width="110" /><ElTableColumn
        label="创建时间"
        min-width="180"
        ><template #default="{ row }">{{ date(row.createdAt) }}</template></ElTableColumn
      ><ElTableColumn label="错误" min-width="260"
        ><template #default="{ row }"
          ><span class="error-table-copy">{{ row.lastError || '—' }}</span></template
        ></ElTableColumn
      ></ElTable
    ><ElEmpty
      v-if="!query.isPending.value && !query.data.value?.length"
      description="暂时没有投递记录"
  /></ElCard>
</template>

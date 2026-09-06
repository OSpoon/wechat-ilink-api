<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Plus, Refresh, View } from '@element-plus/icons-vue'
import { accountsApi, webhooksApi } from '../api/resources'
import PageHeader from '../components/PageHeader.vue'
import StatusTag from '../components/StatusTag.vue'

const router = useRouter()
const queryClient = useQueryClient()
const visible = ref(false)
const accountsQuery = useQuery({
  queryKey: ['accounts'],
  queryFn: async () => (await accountsApi.list()).data,
})
const query = useQuery({
  queryKey: ['webhooks'],
  queryFn: async () => (await webhooksApi.list()).data,
})
const filter = ref('')
const form = reactive({ accountId: '', url: '', secret: '' })
const create = useMutation({
  mutationFn: () => webhooksApi.create({ ...form, events: ['message.received'] }),
  onSuccess: () => {
    visible.value = false
    queryClient.invalidateQueries({ queryKey: ['webhooks'] })
  },
})
const remove = useMutation({
  mutationFn: (id: string) => webhooksApi.remove(id),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['webhooks'] }),
})
const accountName = computed(
  () =>
    new Map(
      (accountsQuery.data.value || []).map((account) => [
        account.id,
        account.ilinkUserId || account.providerAccountId || account.id,
      ])
    )
)
const webhooks = computed(() => query.data.value || [])
const filteredWebhooks = computed(() => {
  const keyword = filter.value.trim().toLowerCase()
  if (!keyword) return webhooks.value
  return webhooks.value.filter((webhook) => {
    const text = [
      webhook.url,
      webhook.accountId,
      accountName.value.get(webhook.accountId) || '',
      ...webhook.events,
    ]
      .join(' ')
      .toLowerCase()
    return text.includes(keyword)
  })
})

function openCreate() {
  Object.assign(form, { accountId: accountsQuery.data.value?.[0]?.id || '', url: '', secret: '' })
  visible.value = true
}
async function submit() {
  if (!form.accountId || !form.url || form.secret.length < 16)
    return ElMessage.warning('请填写账号、合法 URL 和至少 16 位密钥')
  try {
    await create.mutateAsync()
    ElMessage.success('Webhook 创建成功')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '创建失败')
  }
}
async function destroy(id: string) {
  await ElMessageBox.confirm(
    '删除后将停止新的投递，历史记录仍会保留。确定删除吗？',
    '删除 Webhook',
    { type: 'warning' }
  )
    .then(async () => {
      await remove.mutateAsync(id)
      ElMessage.success('Webhook 已删除')
    })
    .catch(() => undefined)
}
function date(value: string | null) {
  return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '—'
}
</script>

<template>
  <PageHeader title="Webhook" description="管理入站消息的回调端点，并排查投递状态。">
    <template #actions
      ><ElButton :icon="Refresh" :loading="query.isFetching.value" @click="query.refetch"
        >刷新</ElButton
      ><ElButton type="primary" :icon="Plus" @click="openCreate">添加 Webhook</ElButton></template
    >
  </PageHeader>
  <ElCard class="panel-card" shadow="never"
    ><div class="toolbar">
      <ElInput
        v-model="filter"
        clearable
        placeholder="搜索回调 URL、账号或事件"
        class="search-input"
      /><span class="toolbar-count">共 {{ filteredWebhooks.length }} 个 Webhook</span>
    </div>
    <ElTable
      v-if="query.isPending.value || webhooks.length || filter"
      v-loading="query.isPending.value"
      :data="filteredWebhooks"
      empty-text=""
      ><ElTableColumn label="端点" min-width="300"
        ><template #default="{ row }"
          ><div class="endpoint-cell">
            <strong>{{ row.url }}</strong
            ><span>{{ accountName.get(row.accountId) || row.accountId }}</span>
          </div></template
        ></ElTableColumn
      ><ElTableColumn label="事件" width="180"
        ><template #default="{ row }"
          ><ElTag v-for="event in row.events" :key="event" size="small">{{
            event
          }}</ElTag></template
        ></ElTableColumn
      ><ElTableColumn label="状态" width="110"
        ><template #default="{ row }"><StatusTag :status="row.enabled" /></template></ElTableColumn
      ><ElTableColumn label="最近投递" min-width="180"
        ><template #default="{ row }">{{ date(row.lastDeliveryAt) }}</template></ElTableColumn
      ><ElTableColumn label="操作" width="210" fixed="right"
        ><template #default="{ row }"
          ><ElButton
            link
            type="primary"
            :icon="View"
            @click="router.push(`/webhooks/${row.id}/deliveries`)"
            >投递记录</ElButton
          ><ElButton
            link
            type="danger"
            :icon="Delete"
            :loading="remove.isPending.value"
            @click="destroy(row.id)"
            >删除</ElButton
          ></template
        ></ElTableColumn
      ><template #empty
        ><ElEmpty
          v-if="!query.isPending.value"
          description="没有匹配的 Webhook" /></template></ElTable
    ><ElEmpty
      v-if="!query.isPending.value && !webhooks.length && !filter"
      description="还没有配置 Webhook"
  /></ElCard>
  <ElDialog v-model="visible" title="添加 Webhook" width="520px"
    ><ElForm label-position="top" autocomplete="off"
      ><ElFormItem label="关联账号"
        ><ElSelect v-model="form.accountId" placeholder="选择微信账号" class="full-width"
          ><ElOption
            v-for="account in accountsQuery.data.value || []"
            :key="account.id"
            :label="account.ilinkUserId || account.providerAccountId || account.id"
            :value="account.id" /></ElSelect></ElFormItem
      ><ElFormItem label="回调 URL"
        ><ElInput
          v-model="form.url"
          autocomplete="url"
          placeholder="https://your-app.example.com/hooks/weixin" /></ElFormItem
      ><ElFormItem label="签名密钥"
        ><ElInput
          v-model="form.secret"
          type="password"
          autocomplete="new-password"
          show-password
          minlength="16"
          placeholder="至少 16 位，密钥只在这里提交"
        />
        <div class="field-tip">服务端只保存加密后的密钥，请妥善保管原始密钥。</div></ElFormItem
      ></ElForm
    ><template #footer
      ><ElButton @click="visible = false">取消</ElButton
      ><ElButton type="primary" :loading="create.isPending.value" @click="submit"
        >创建</ElButton
      ></template
    ></ElDialog
  >
</template>

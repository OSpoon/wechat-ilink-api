<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  ChatDotRound,
  Connection,
  Document,
  Download,
  Headset,
  Picture,
  Promotion,
  Refresh,
  Upload,
  VideoCamera,
} from '@element-plus/icons-vue'
import { accountsApi, messagesApi } from '../api/resources'
import PageHeader from '../components/PageHeader.vue'
import StatusTag from '../components/StatusTag.vue'
import type { WeixinMessage } from '../types/api'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const accountId = String(route.params.id)
const target = ref('')
const text = ref('')
const mediaType = ref<'image' | 'video' | 'file'>('image')
const mediaCaption = ref('')
const mediaFile = ref<File | null>(null)
const mediaLoading = ref<string | null>(null)
const composeMode = ref<'text' | 'media'>('text')
const mediaInput = ref<HTMLInputElement | null>(null)
const mediaPreviewVisible = ref(false)
const mediaPreview = ref<{
  kind: MediaKind
  fileName: string
  url: string
  contentType: string
} | null>(null)
const accountQuery = useQuery({
  queryKey: ['account', accountId],
  queryFn: async () => (await accountsApi.get(accountId)).data,
})
const messagesQuery = useQuery({
  queryKey: ['messages', accountId],
  queryFn: async () => (await messagesApi.list(accountId, 100)).data,
  refetchInterval: 5000,
})
const send = useMutation({
  mutationFn: () => messagesApi.sendText(accountId, target.value.trim(), text.value),
  onSuccess: () => {
    text.value = ''
    queryClient.invalidateQueries({ queryKey: ['messages', accountId] })
  },
})
const sendMedia = useMutation({
  mutationFn: () =>
    messagesApi.sendMedia(accountId, {
      to: target.value.trim(),
      mediaType: mediaType.value,
      caption: mediaCaption.value.trim() || undefined,
      file: mediaFile.value as File,
    }),
  onSuccess: () => {
    mediaCaption.value = ''
    mediaFile.value = null
    if (mediaInput.value) mediaInput.value.value = ''
    queryClient.invalidateQueries({ queryKey: ['messages', accountId] })
  },
})
const typing = useMutation({
  mutationFn: (status: 1 | 2) => messagesApi.typing(accountId, target.value.trim(), status),
})
const account = computed(() => accountQuery.data.value)
const messages = computed(() => [...(messagesQuery.data.value || [])].reverse())

type MediaKind = 'image' | 'video' | 'voice' | 'file'
type MessageItemView = {
  index: number
  kind: MediaKind
  label: string
  fileName: string
  caption: string
  available: boolean
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function stringValue(...values: unknown[]) {
  return values.find((value) => typeof value === 'string' && value.trim()) as string | undefined
}

function mediaKind(value: unknown): MediaKind | 'text' | null {
  const normalized = String(value ?? '').toLowerCase()
  if (normalized === '1' || normalized === 'text') return 'text'
  if (normalized === '2' || normalized === 'image' || normalized === 'picture') return 'image'
  if (normalized === '3' || normalized === 'voice' || normalized === 'audio') return 'voice'
  if (normalized === '4' || normalized === 'file' || normalized === 'document') return 'file'
  if (normalized === '5' || normalized === 'video') return 'video'
  return null
}

function itemKind(item: Record<string, unknown>) {
  const direct = mediaKind(item.type)
  if (direct) return direct
  if (item.image_item) return 'image' as const
  if (item.voice_item) return 'voice' as const
  if (item.file_item) return 'file' as const
  if (item.video_item) return 'video' as const
  return null
}

function mediaLabel(kind: MediaKind) {
  return { image: '图片', video: '视频', voice: '音频', file: '文件' }[kind]
}

function mediaIcon(kind: MediaKind) {
  return { image: Picture, video: VideoCamera, voice: Headset, file: Document }[kind]
}

function mediaAction(kind: MediaKind) {
  return kind === 'image'
    ? '预览图片'
    : kind === 'video'
      ? '预览视频'
      : kind === 'file'
        ? '查看文件'
        : '打开音频'
}

function itemData(item: Record<string, unknown>, kind: MediaKind) {
  return record(item[`${kind}_item`])
}

function messageText(message: WeixinMessage) {
  const payload = message.payload
  const directText = stringValue(payload.text)
  if (directText) return directText
  const textItem = record(payload.text_item)
  if (textItem && stringValue(textItem.text)) return stringValue(textItem.text) as string

  const itemList = Array.isArray(payload.item_list) ? payload.item_list : []
  return itemList
    .map((value) => {
      const item = record(value)
      if (!item || itemKind(item) !== 'text') return ''
      return stringValue(record(item.text_item)?.text) || ''
    })
    .filter(Boolean)
    .join('\n')
}

function messageItems(message: WeixinMessage): MessageItemView[] {
  const payload = message.payload
  const itemList = Array.isArray(payload.item_list) ? payload.item_list : []
  const items = itemList.flatMap((value, index) => {
    const item = record(value)
    const kind = item ? itemKind(item) : null
    if (!item || !kind || kind === 'text') return []
    const data = itemData(item, kind)
    const fileName =
      stringValue(data?.file_name, data?.fileName, item.file_name) || mediaLabel(kind)
    return [
      {
        index,
        kind,
        label: mediaLabel(kind),
        fileName,
        caption: stringValue(data?.caption, item.caption) || '',
        available: message.media.some((media) => media.itemIndex === index),
      },
    ]
  })

  if (items.length) return items
  const kind = mediaKind(payload.type)
  if (!kind || kind === 'text') return []
  return [
    {
      index: 0,
      kind,
      label: mediaLabel(kind),
      fileName: stringValue(payload.fileName, payload.file_name) || mediaLabel(kind),
      caption: stringValue(payload.caption) || '',
      available: message.media.some((media) => media.itemIndex === 0),
    },
  ]
}

function clearMediaPreview() {
  if (mediaPreview.value) URL.revokeObjectURL(mediaPreview.value.url)
  mediaPreview.value = null
  mediaPreviewVisible.value = false
}
function date(value: string) {
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}
async function submit() {
  if (!target.value.trim() || !text.value.trim())
    return ElMessage.warning('请填写目标用户 ID 和消息内容')
  try {
    await send.mutateAsync()
    ElMessage.success('消息已发送')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '消息发送失败')
  }
}
function selectFile(event: Event) {
  mediaFile.value = (event.target as HTMLInputElement).files?.[0] || null
}
function mediaAccept() {
  if (mediaType.value === 'image') return 'image/*'
  if (mediaType.value === 'video') return 'video/*'
  return '*/*'
}
async function submitMedia() {
  if (!target.value.trim() || !mediaFile.value)
    return ElMessage.warning('请填写目标用户 ID 并选择文件')
  try {
    await sendMedia.mutateAsync()
    ElMessage.success('媒体消息已发送')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '媒体消息发送失败')
  }
}
async function sendTyping(status: 1 | 2) {
  if (!target.value.trim()) return ElMessage.warning('请先填写目标用户 ID')
  try {
    await typing.mutateAsync(status)
    ElMessage.success(status === 1 ? '已发送“正在输入”状态' : '已取消输入状态')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '输入状态发送失败')
  }
}
async function openMedia(message: WeixinMessage, item: MessageItemView) {
  const mediaReference = message.media.find((media) => media.itemIndex === item.index)
  if (!mediaReference) {
    ElMessage.info('该消息只有媒体记录，当前 API 未提供可下载的媒体内容')
    return
  }
  const key = `${message.id}:${item.index}:preview`
  mediaLoading.value = key
  try {
    const blob = await messagesApi.downloadMedia(accountId, message.id, item.index)
    clearMediaPreview()
    mediaPreview.value = {
      kind: item.kind,
      fileName: item.fileName,
      url: URL.createObjectURL(blob),
      contentType: blob.type,
    }
    mediaPreviewVisible.value = true
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '媒体下载失败')
  } finally {
    mediaLoading.value = null
  }
}
function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
async function downloadMediaItem(message: WeixinMessage, item: MessageItemView) {
  const mediaReference = message.media.find((media) => media.itemIndex === item.index)
  if (!mediaReference) {
    ElMessage.info('该消息只有媒体记录，当前 API 未提供可下载的媒体内容')
    return
  }
  const key = `${message.id}:${item.index}:download`
  mediaLoading.value = key
  try {
    const blob = await messagesApi.downloadMedia(accountId, message.id, item.index)
    saveBlob(blob, item.fileName)
    ElMessage.success('媒体已开始下载')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '媒体下载失败')
  } finally {
    mediaLoading.value = null
  }
}
function downloadPreview() {
  if (!mediaPreview.value) return
  fetch(mediaPreview.value.url)
    .then((response) => response.blob())
    .then((blob) => saveBlob(blob, mediaPreview.value?.fileName || 'weixin-media'))
    .catch(() => ElMessage.error('媒体下载失败'))
}
onBeforeUnmount(clearMediaPreview)
</script>

<template>
  <PageHeader :title="account?.ilinkUserId || '账号详情'" :description="account?.id">
    <template #actions
      ><ElButton :icon="ArrowLeft" @click="router.push('/accounts')">返回账号列表</ElButton
      ><ElButton
        :icon="Refresh"
        :loading="messagesQuery.isFetching.value"
        @click="messagesQuery.refetch"
        >刷新消息</ElButton
      ></template
    >
  </PageHeader>
  <div v-if="accountQuery.isPending.value" class="loading-page">
    <ElSkeleton :rows="5" animated />
  </div>
  <template v-else-if="account">
    <ElCard class="panel-card connection-card" shadow="never"
      ><template #header
        ><div class="card-header">
          <div class="card-heading-copy">
            <div class="card-heading-icon">
              <ElIcon><Connection /></ElIcon>
            </div>
            <div>
              <h2>连接信息</h2>
              <p>当前账号的连接状态和活动时间</p>
            </div>
          </div>
          <StatusTag :status="account.status" /></div
      ></template>
      <div class="connection-body">
        <div class="connection-summary">
          <div class="connection-summary-icon">
            <ElIcon><Connection /></ElIcon>
          </div>
          <div class="connection-summary-copy">
            <span>消息通道</span>
            <strong>支持文本与媒体消息</strong>
          </div>
        </div>
        <div class="detail-list connection-details">
          <div class="detail-item">
            <span>账号 ID</span><strong>{{ account.id }}</strong>
          </div>
          <div class="detail-item">
            <span>iLink 用户 ID</span><strong>{{ account.ilinkUserId || '未返回' }}</strong>
          </div>
          <div class="detail-item">
            <span>最近收到消息</span
            ><strong>{{ account.lastInboundAt ? date(account.lastInboundAt) : '暂无记录' }}</strong>
          </div>
          <div class="detail-item">
            <span>最近发送消息</span
            ><strong>{{
              account.lastOutboundAt ? date(account.lastOutboundAt) : '暂无记录'
            }}</strong>
          </div>
        </div>
      </div>
      <ElAlert
        v-if="account.lastError"
        class="inline-alert"
        type="error"
        :title="account.lastError"
        :closable="false"
    /></ElCard>
    <div class="detail-lower-grid">
      <ElCard class="panel-card composer-card" shadow="never">
        <template #header>
          <div class="composer-heading">
            <div class="composer-heading-copy">
              <div class="composer-icon">
                <ElIcon><Promotion /></ElIcon>
              </div>
              <div>
                <h2>发送消息</h2>
                <p>通过此账号向指定微信用户发送测试内容</p>
              </div>
            </div>
          </div>
        </template>
        <div class="composer-form">
          <div class="form-section-label">发送给</div>
          <ElInput
            v-model="target"
            clearable
            autocomplete="off"
            placeholder="输入微信用户 ID，例如 user_xxx"
          >
            <template #prefix><span class="target-prefix">TO</span></template>
          </ElInput>
          <div v-if="account.status === 'reauth_required'" class="composer-warning">
            当前账号需要重新登录，完成扫码后才能发送消息。
          </div>

          <ElTabs v-model="composeMode" class="composer-tabs">
            <ElTabPane label="文本消息" name="text">
              <ElInput
                v-model="text"
                type="textarea"
                :rows="6"
                maxlength="4000"
                show-word-limit
                placeholder="输入要发送的文本…"
              />
              <div class="composer-hint">文本消息会通过当前微信账号立即发送。</div>
            </ElTabPane>
            <ElTabPane label="媒体消息" name="media">
              <div class="media-type-row">
                <div class="form-section-label">媒体类型</div>
                <ElSelect v-model="mediaType" class="media-type-select">
                  <ElOption label="图片" value="image" />
                  <ElOption label="视频" value="video" />
                  <ElOption label="文件" value="file" />
                </ElSelect>
              </div>
              <label class="upload-dropzone" :class="{ selected: mediaFile }">
                <input
                  ref="mediaInput"
                  class="hidden-file-input"
                  type="file"
                  :accept="mediaAccept()"
                  @change="selectFile"
                />
                <ElIcon><Upload /></ElIcon>
                <strong>{{ mediaFile ? mediaFile.name : '选择要发送的文件' }}</strong>
                <span>支持图片、视频或文件，单个文件最大 20 MB</span>
              </label>
              <ElInput
                v-model="mediaCaption"
                maxlength="4000"
                placeholder="添加说明（可选）"
                class="media-caption-input"
              />
            </ElTabPane>
          </ElTabs>

          <div class="composer-footer">
            <div class="typing-control">
              <span class="typing-label"
                ><ElIcon><ChatDotRound /></ElIcon>输入状态</span
              >
              <ElButton
                text
                :loading="typing.isPending.value"
                :disabled="account.status === 'reauth_required'"
                @click="sendTyping(1)"
              >
                正在输入
              </ElButton>
              <ElButton
                text
                :loading="typing.isPending.value"
                :disabled="account.status === 'reauth_required'"
                @click="sendTyping(2)"
              >
                清除状态
              </ElButton>
            </div>
            <ElButton
              type="primary"
              :icon="Promotion"
              :loading="composeMode === 'text' ? send.isPending.value : sendMedia.isPending.value"
              :disabled="
                account.status === 'reauth_required' ||
                !target.trim() ||
                (composeMode === 'text' ? !text.trim() : !mediaFile)
              "
              @click="composeMode === 'text' ? submit() : submitMedia()"
            >
              {{ composeMode === 'text' ? '发送文本' : '发送媒体' }}
            </ElButton>
          </div>
        </div>
      </ElCard>
      <ElCard class="panel-card messages-panel" shadow="never"
        ><template #header
          ><div class="card-header">
            <div class="card-heading-copy">
              <div class="card-heading-icon">
                <ElIcon><ChatDotRound /></ElIcon>
              </div>
              <div>
                <h2>最近消息</h2>
                <p>当前 API 返回最近 100 条消息，页面每 5 秒刷新一次</p>
              </div>
            </div>
            <span class="toolbar-count">{{ messages.length }} 条</span>
          </div></template
        ><ElEmpty v-if="!messages.length" description="还没有消息记录" />
        <div v-else class="message-list">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-row"
            :class="message.direction"
          >
            <div class="message-bubble">
              <div class="message-meta">
                <StatusTag :status="message.status" /><span
                  >{{ message.direction === 'inbound' ? '收到' : '发送' }} ·
                  {{ date(message.createdAt) }}</span
                >
              </div>
              <p v-if="messageText(message)" class="message-text">{{ messageText(message) }}</p>
              <div v-if="messageItems(message).length" class="message-media-list">
                <div
                  v-for="item in messageItems(message)"
                  :key="item.index"
                  class="message-media-item"
                >
                  <span class="message-media-icon"
                    ><ElIcon><component :is="mediaIcon(item.kind)" /></ElIcon
                  ></span>
                  <span class="message-media-copy">
                    <strong>{{ item.fileName }}</strong>
                    <span
                      >{{ item.label
                      }}<template v-if="item.caption"> · {{ item.caption }}</template></span
                    >
                  </span>
                  <ElButton
                    v-if="item.available"
                    link
                    size="small"
                    :loading="mediaLoading === `${message.id}:${item.index}:preview`"
                    @click="openMedia(message, item)"
                    >{{ mediaAction(item.kind) }}</ElButton
                  >
                  <ElButton
                    v-if="item.available"
                    link
                    size="small"
                    :loading="mediaLoading === `${message.id}:${item.index}:download`"
                    @click="downloadMediaItem(message, item)"
                    >下载</ElButton
                  >
                  <span v-else class="message-media-action">仅记录</span>
                </div>
              </div>
              <p
                v-if="!messageText(message) && !messageItems(message).length"
                class="message-unavailable"
              >
                暂无可展示的消息内容
              </p>
              <small>{{
                message.direction === 'inbound'
                  ? `来自 ${message.from || '未知用户'}`
                  : `发送给 ${message.to || '未知用户'}`
              }}</small>
            </div>
          </div>
        </div></ElCard
      >
    </div>
    <ElDialog
      v-model="mediaPreviewVisible"
      title="媒体预览"
      width="680px"
      @closed="clearMediaPreview"
    >
      <div v-if="mediaPreview" class="media-preview">
        <img
          v-if="mediaPreview.kind === 'image'"
          :src="mediaPreview.url"
          :alt="mediaPreview.fileName"
          class="media-preview-image"
        />
        <video
          v-else-if="mediaPreview.kind === 'video'"
          :src="mediaPreview.url"
          controls
          class="media-preview-video"
        />
        <audio v-else-if="mediaPreview.kind === 'voice'" :src="mediaPreview.url" controls />
        <div v-else class="media-preview-file">
          <ElIcon><Document /></ElIcon>
          <strong>{{ mediaPreview.fileName }}</strong>
          <span>该文件已准备好，可以下载到本地查看。</span>
        </div>
      </div>
      <template #footer>
        <ElButton v-if="mediaPreview" type="primary" :icon="Download" @click="downloadPreview">
          下载媒体
        </ElButton>
        <ElButton @click="mediaPreviewVisible = false">关闭</ElButton>
      </template>
    </ElDialog>
  </template>
</template>

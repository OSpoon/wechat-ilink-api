import type { HttpContext } from '@adonisjs/core/http'
import {
  createWebhook,
  deleteWebhook,
  listWebhookDeliveries,
  listWebhooks,
} from '#services/weixin/webhook_service'
import { createWebhookValidator } from '#validators/weixin'

export default class WeixinWebhooksController {
  /**
   * @index
   * @tag 消息回调
   * @summary 查询 Webhook 列表
   * @description 返回当前 API 用户配置的账号级 Webhook。
   * @responseBody 200 - {"data":[{"id":"wxhook_xxx","accountId":"wxacc_xxx","url":"https://your-app.example.com/hooks/weixin","events":["message.received"],"enabled":true,"lastDeliveryAt":"2026-09-05T09:56:00.000Z","createdAt":"2026-09-05T09:50:00.000Z","updatedAt":"2026-09-05T09:56:00.000Z"}]} - 返回 Webhook 列表。
   */
  async index({ auth, serialize }: HttpContext) {
    return await serialize(await listWebhooks(auth.getUserOrFail().id))
  }

  /**
   * @store
   * @tag 消息回调
   * @summary 创建 Webhook
   * @description 为指定微信账号创建入站消息 Webhook，并使用密钥签名投递内容。
   * @requestBody {"accountId":"wxacc_xxx","url":"https://your-app.example.com/hooks/weixin","secret":"replace-with-at-least-16-chars","events":["message.received"]}
   * @responseBody 201 - {"data":{"id":"wxhook_xxx","accountId":"wxacc_xxx","url":"https://your-app.example.com/hooks/weixin","events":["message.received"],"enabled":true,"lastDeliveryAt":"","createdAt":"2026-09-05T09:50:00.000Z","updatedAt":"2026-09-05T09:50:00.000Z"}} - Webhook 创建成功。
   */
  async store({ auth, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createWebhookValidator)
    const endpoint = await createWebhook({
      userId: auth.getUserOrFail().id,
      accountId: payload.accountId,
      url: payload.url,
      secret: payload.secret,
      events: payload.events,
    })
    return response.created(await serialize(endpoint))
  }

  /**
   * @destroy
   * @tag 消息回调
   * @summary 删除 Webhook
   * @description 删除指定的 Webhook 配置。
   */
  async destroy({ auth, params, response }: HttpContext) {
    const deleted = await deleteWebhook(auth.getUserOrFail().id, params.webhookId)
    if (!deleted) {
      return response.notFound({
        error: { code: 'WEBHOOK_NOT_FOUND', message: 'Webhook endpoint not found' },
      })
    }
    return response.noContent()
  }

  /**
   * @deliveries
   * @tag 消息回调
   * @summary 查询 Webhook 投递记录
   * @description 返回指定 Webhook 的投递状态、尝试次数和最近错误。
   * @responseBody 200 - {"data":[{"id":"wxdel_xxx","eventType":"message.received","eventId":"wxmsg_xxx","status":"delivered","attempts":1,"lastError":"","nextAttemptAt":"","deliveredAt":"2026-09-05T09:56:00.000Z","createdAt":"2026-09-05T09:55:00.000Z","updatedAt":"2026-09-05T09:56:00.000Z"}]} - 返回 Webhook 投递记录。
   */
  async deliveries({ auth, params, response, serialize }: HttpContext) {
    const deliveries = await listWebhookDeliveries(auth.getUserOrFail().id, params.webhookId)
    if (!deliveries) {
      return response.notFound({
        error: { code: 'WEBHOOK_NOT_FOUND', message: 'Webhook endpoint not found' },
      })
    }
    return await serialize(deliveries)
  }
}

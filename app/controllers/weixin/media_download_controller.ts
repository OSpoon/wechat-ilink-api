import type { HttpContext } from '@adonisjs/core/http'
import { findAccountOrFail } from '#services/weixin/account_service'
import WeixinMessage from '#models/weixin_message'
import { downloadInboundMedia } from '#services/weixin/media_download_service'
import { decodeMessagePayload } from '#services/weixin/message_payload_service'

export default class WeixinMediaDownloadController {
  /**
   * @show
   * @tag 微信消息
   * @summary 下载入站媒体
   * @description 下载并解密指定入站消息中的图片、语音、文件或视频。
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const account = await findAccountOrFail(user.id, params.accountId)
    const message = await WeixinMessage.query()
      .where('account_id', account.id)
      .where('id', params.messageId)
      .first()
    if (!message) {
      return response.notFound({
        error: { code: 'MESSAGE_NOT_FOUND', message: 'Message not found' },
      })
    }

    const itemIndex = Number(params.itemIndex)
    const payload = decodeMessagePayload<{
      item_list?: Array<Parameters<typeof downloadInboundMedia>[0]['item']>
    }>(message.payload)
    const item = payload.item_list?.[itemIndex]
    if (!Number.isInteger(itemIndex) || itemIndex < 0 || !item) {
      return response.notFound({
        error: { code: 'MEDIA_ITEM_NOT_FOUND', message: 'Media item not found' },
      })
    }

    const media = await downloadInboundMedia({ item, cdnBaseUrl: account.cdnBaseUrl })
    response.header('Content-Type', media.contentType)
    response.header(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(media.fileName)}`
    )
    return response.send(media.buffer)
  }
}

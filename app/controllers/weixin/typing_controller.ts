import type { HttpContext } from '@adonisjs/core/http'
import { findAccountOrFail } from '#services/weixin/account_service'
import { sendTypingStatus } from '#services/weixin/typing_service'
import { typingValidator } from '#validators/weixin'

export default class WeixinTypingController {
  /**
   * @store
   * @tag 微信消息
   * @summary 发送输入状态
   * @description 向目标用户发送正在输入或取消输入状态。
   * @requestBody {"to":"user_xxx","status":1,"contextToken":"optional-context-token"}
   * @responseBody 200 - {"data":{"to":"user_xxx","status":1}} - 输入状态发送成功。
   */
  async store({ auth, params, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(typingValidator)
    const account = await findAccountOrFail(user.id, params.accountId)
    const result = await sendTypingStatus({
      account,
      toUserId: payload.to,
      status: payload.status as 1 | 2,
      contextToken: payload.contextToken,
    })
    return response.ok(await serialize(result))
  }
}

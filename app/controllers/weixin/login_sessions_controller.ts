import type { HttpContext } from '@adonisjs/core/http'
import { verifyCodeValidator } from '#validators/weixin'
import {
  cancelLogin,
  getLoginSession,
  startLogin,
  submitVerifyCode,
} from '#services/weixin/login_service'

function present(session: Awaited<ReturnType<typeof getLoginSession>>) {
  if (!session) return null
  return {
    id: session.id,
    status: session.status,
    qrUrl:
      session.status === 'waiting_scan' ||
      session.status === 'scanned' ||
      session.status === 'need_verifycode'
        ? session.qrcodeUrl
        : undefined,
    accountId: session.accountId ?? null,
    ilinkUserId: session.ilinkUserId ?? null,
    errorMessage: session.errorMessage ?? null,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  }
}

export default class WeixinLoginSessionsController {
  /**
   * @store
   * @tag 微信接入
   * @summary 创建二维码登录会话
   * @description 创建微信二维码并返回登录会话 ID，之后需要轮询会话状态。
   * @responseBody 202 - {"data":{"id":"wxlogin_xxx","status":"waiting_scan","qrUrl":"https://ilinkai.weixin.qq.com/qr/xxx","accountId":"wxacc_xxx","ilinkUserId":"wxuser_xxx","errorMessage":"","expiresAt":"2026-09-05T10:00:00.000Z","createdAt":"2026-09-05T09:55:00.000Z","updatedAt":"2026-09-05T09:55:00.000Z"}} - 二维码登录会话已创建。
   */
  async store({ auth, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const session = await startLogin(user.id)
    return response.accepted(await serialize(present(session)))
  }

  /**
   * @show
   * @tag 微信接入
   * @summary 查询二维码登录状态
   * @description 查询扫码、验证和登录确认状态。
   * @responseBody 200 - {"data":{"id":"wxlogin_xxx","status":"confirmed","qrUrl":"https://ilinkai.weixin.qq.com/qr/xxx","accountId":"wxacc_xxx","ilinkUserId":"wxuser_xxx","errorMessage":"","expiresAt":"2026-09-05T10:00:00.000Z","createdAt":"2026-09-05T09:55:00.000Z","updatedAt":"2026-09-05T09:56:00.000Z"}} - 返回当前二维码登录状态。
   * @responseBody 404 - {"error":{"code":"LOGIN_SESSION_NOT_FOUND","message":"登录会话不存在"}} - 登录会话不存在。
   */
  async show({ auth, params, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const session = await getLoginSession(user.id, params.sessionId)
    if (!session)
      return response.notFound({
        error: { code: 'LOGIN_SESSION_NOT_FOUND', message: 'Login session not found' },
      })
    return await serialize(present(session))
  }

  /**
   * @verify
   * @tag 微信接入
   * @summary 提交微信安全验证码
   * @description 当微信要求数字验证时提交手机上显示的验证码。
   * @requestBody {"code":"123456"}
   * @responseBody 200 - {"data":{"id":"wxlogin_xxx","status":"verifying","qrUrl":"https://ilinkai.weixin.qq.com/qr/xxx","accountId":"wxacc_xxx","ilinkUserId":"wxuser_xxx","errorMessage":"","expiresAt":"2026-09-05T10:00:00.000Z","createdAt":"2026-09-05T09:55:00.000Z","updatedAt":"2026-09-05T09:55:00.000Z"}} - 验证码已提交。
   */
  async verify({ auth, params, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(verifyCodeValidator)
    return await serialize(present(await submitVerifyCode(user.id, params.sessionId, payload.code)))
  }

  /**
   * @destroy
   * @tag 微信接入
   * @summary 取消二维码登录
   * @description 取消尚未完成的二维码登录会话。
   * @responseBody 404 - {"error":{"code":"LOGIN_SESSION_NOT_FOUND","message":"登录会话不存在"}} - 登录会话不存在。
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const session = await cancelLogin(user.id, params.sessionId)
    if (!session)
      return response.notFound({
        error: { code: 'LOGIN_SESSION_NOT_FOUND', message: 'Login session not found' },
      })
    return response.noContent()
  }
}

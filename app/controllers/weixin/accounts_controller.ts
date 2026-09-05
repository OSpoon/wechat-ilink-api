import type { HttpContext } from '@adonisjs/core/http'
import { connectionManager } from '#services/weixin/connection_manager'
import { findAccountOrFail, listAccounts, toPublicAccount } from '#services/weixin/account_service'

export default class WeixinAccountsController {
  /**
   * @index
   * @tag 微信账号
   * @summary 查询微信账号列表
   * @description 返回当前 API 用户已绑定的全部微信账号。
   * @responseBody 200 - {"data":[{"id":"wxacc_xxx","providerAccountId":"ilink_bot_xxx","ilinkUserId":"wxuser_xxx","baseUrl":"https://ilinkai.weixin.qq.com","cdnBaseUrl":"https://novac2c.cdn.weixin.qq.com/c2c","status":"running","enabled":true,"lastError":"","lastInboundAt":"2026-09-05T09:55:00.000Z","lastOutboundAt":"2026-09-05T09:56:00.000Z","createdAt":"2026-09-05T09:50:00.000Z","updatedAt":"2026-09-05T09:56:00.000Z"}]} - 返回微信账号列表。
   */
  async index({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    return await serialize(await listAccounts(user.id))
  }

  /**
   * @show
   * @tag 微信账号
   * @summary 查询微信账号详情
   * @description 返回指定微信账号的连接状态和最近活动信息。
   * @responseBody 200 - {"data":{"id":"wxacc_xxx","providerAccountId":"ilink_bot_xxx","ilinkUserId":"wxuser_xxx","baseUrl":"https://ilinkai.weixin.qq.com","cdnBaseUrl":"https://novac2c.cdn.weixin.qq.com/c2c","status":"running","enabled":true,"lastError":"","lastInboundAt":"2026-09-05T09:55:00.000Z","lastOutboundAt":"2026-09-05T09:56:00.000Z","createdAt":"2026-09-05T09:50:00.000Z","updatedAt":"2026-09-05T09:56:00.000Z"}} - 返回微信账号详情。
   */
  async show({ auth, params, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    return await serialize(toPublicAccount(await findAccountOrFail(user.id, params.accountId)))
  }

  /**
   * @start
   * @tag 微信账号
   * @summary 启动微信账号
   * @description 启动指定账号的 iLink 长轮询 Worker。
   * @responseBody 202 - {"data":{"id":"wxacc_xxx","providerAccountId":"ilink_bot_xxx","ilinkUserId":"wxuser_xxx","status":"starting","enabled":true}} - 微信账号 Worker 已启动。
   */
  async start({ auth, params, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const account = await connectionManager.start(user.id, params.accountId)
    return response.accepted(await serialize(toPublicAccount(account)))
  }

  /**
   * @stop
   * @tag 微信账号
   * @summary 停止微信账号
   * @description 停止指定账号的 iLink 长轮询 Worker。
   * @responseBody 200 - {"data":{"id":"wxacc_xxx","providerAccountId":"ilink_bot_xxx","ilinkUserId":"wxuser_xxx","status":"stopped","enabled":false}} - 微信账号 Worker 已停止。
   */
  async stop({ auth, params, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    return await serialize(toPublicAccount(await connectionManager.stop(user.id, params.accountId)))
  }
}

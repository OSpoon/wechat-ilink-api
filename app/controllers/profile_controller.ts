import UserTransformer from '#transformers/user_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  /**
   * @show
   * @tag 账号管理
   * @summary 获取当前用户信息
   * @description 返回当前 Bearer 令牌对应的 API 用户资料。
   * @responseBody 200 - {"data":{"id":1,"fullName":"Test Developer","email":"test@example.com","createdAt":"2026-09-05T09:55:00.000Z","updatedAt":"2026-09-05T09:55:00.000Z","initials":"TD"}} - 返回当前 API 用户资料。
   */
  async show({ auth, serialize }: HttpContext) {
    return await serialize(UserTransformer.transform(auth.getUserOrFail()))
  }
}

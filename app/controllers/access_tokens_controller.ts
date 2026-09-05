import User from '#models/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class AccessTokensController {
  /**
   * @store
   * @tag 用户认证
   * @summary 登录并获取访问令牌
   * @description 使用邮箱和密码登录 API，返回后续业务接口所需的 Bearer 访问令牌。
   * @requestBody {"email":"developer@example.com","password":"change-me-123"}
   * @responseBody 201 - {"data":{"user":{"id":1,"fullName":"Test Developer","email":"test@example.com","createdAt":"2026-09-05T09:55:00.000Z","updatedAt":"2026-09-05T09:55:00.000Z","initials":"TD"},"token":"oat_xxx"}} - 登录成功并返回访问令牌。
   */
  async store({ request, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

    return await serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }

  /**
   * @destroy
   * @tag 账号管理
   * @summary 退出登录
   * @description 撤销当前访问令牌。
   */
  async destroy({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    return {
      message: 'Logged out successfully',
    }
  }
}

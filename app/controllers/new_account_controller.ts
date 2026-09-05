import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class NewAccountController {
  /**
   * @store
   * @tag 用户认证
   * @summary 注册 API 用户
   * @description 创建 API 用户并返回访问令牌。
   * @requestBody {"fullName":"Demo Developer","email":"developer@example.com","password":"change-me-123","passwordConfirmation":"change-me-123"}
   * @responseBody 201 - {"data":{"user":{"id":1,"fullName":"Demo Developer","email":"developer@example.com","createdAt":"2026-09-05T09:55:00.000Z","updatedAt":"2026-09-05T09:55:00.000Z","initials":"DD"},"token":"oat_xxx"}} - API 用户创建成功。
   */
  async store({ request, serialize }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(signupValidator)

    const user = await User.create({ fullName, email, password })
    const token = await User.accessTokens.create(user)

    return await serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }
}

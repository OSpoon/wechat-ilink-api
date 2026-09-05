import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'
import { ApiOperation, ApiResponse, ApiSchema } from '@foadonis/openapi/decorators'
import { AuthResponseDocument, ErrorResponseDocument } from '#openapi/schemas'

export default class NewAccountController {
  @ApiOperation({ summary: '注册 API 用户', description: '创建 API 用户并返回访问令牌。' })
  @ApiSchema(signupValidator)
  @ApiResponse({ status: 200, description: 'API 用户创建成功。', type: AuthResponseDocument })
  @ApiResponse({ status: 422, description: '注册参数校验失败。', type: ErrorResponseDocument })
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

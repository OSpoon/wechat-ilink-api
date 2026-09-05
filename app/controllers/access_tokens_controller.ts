import User from '#models/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'
import { ApiOperation, ApiResponse, ApiSchema, ApiSecurity } from '@foadonis/openapi/decorators'
import {
  AuthResponseDocument,
  ErrorResponseDocument,
  MessageResponseDocument,
} from '#openapi/schemas'

export default class AccessTokensController {
  @ApiOperation({
    summary: '登录并获取访问令牌',
    description: '使用邮箱和密码登录 API，返回后续业务接口所需的 Bearer 访问令牌。',
  })
  @ApiSchema(loginValidator)
  @ApiResponse({ status: 200, description: '登录成功并返回访问令牌。', type: AuthResponseDocument })
  @ApiResponse({ status: 401, description: '邮箱或密码错误。', type: ErrorResponseDocument })
  async store({ request, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

    return await serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }

  @ApiSecurity('BearerAuth')
  @ApiOperation({ summary: '退出登录', description: '撤销当前访问令牌。' })
  @ApiResponse({ status: 200, description: '当前访问令牌已撤销。', type: MessageResponseDocument })
  @ApiResponse({ status: 401, description: '访问令牌缺失或无效。', type: ErrorResponseDocument })
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

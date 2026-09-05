import UserTransformer from '#transformers/user_transformer'
import type { HttpContext } from '@adonisjs/core/http'
import { ApiOperation, ApiResponse, ApiSecurity } from '@foadonis/openapi/decorators'
import { ErrorResponseDocument, UserResponseDocument } from '#openapi/schemas'

export default class ProfileController {
  @ApiSecurity('BearerAuth')
  @ApiOperation({
    summary: '获取当前用户信息',
    description: '返回当前 Bearer 令牌对应的 API 用户资料。',
  })
  @ApiResponse({ status: 200, description: '返回当前 API 用户资料。', type: UserResponseDocument })
  @ApiResponse({ status: 401, description: '访问令牌缺失或无效。', type: ErrorResponseDocument })
  async show({ auth, serialize }: HttpContext) {
    return await serialize(UserTransformer.transform(auth.getUserOrFail()))
  }
}

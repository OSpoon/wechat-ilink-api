import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

export default {
  path: path.join(projectRoot, '..'),
  productionEnv: 'production',
  info: {
    title: '微信 iLink API',
    version: '0.1.0',
    description:
      '通过 iLink 协议连接微信的 API 服务，提供扫码登录、消息收发、媒体和 Webhook 能力。',
  },
  tagIndex: 3,
  ignore: ['/docs', '/openapi.json', '/swagger'],
  snakeCase: false,
  authMiddlewares: ['auth'],
  defaultSecurityScheme: 'BearerAuth',
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'API 访问令牌',
    },
  },
  persistAuthorization: true,
}

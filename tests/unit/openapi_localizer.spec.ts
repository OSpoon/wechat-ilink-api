import { test } from '@japa/runner'
import { localizeOpenApiDocument } from '#services/openapi_localizer'

test('OpenAPI localization translates generated descriptions without changing schema keys', ({
  assert,
}) => {
  const document = {
    tags: [{ name: '微信消息', description: 'generated' }],
    components: {
      responses: {
        Accepted: { description: 'Accepted' },
        NotFound: { description: 'NotFound' },
      },
    },
    paths: {
      '/api/v1/weixin/messages': {
        post: {
          summary: 'Store (store)',
          description: 'Generated description\n\n _controller.ts:10_ - **store**',
          requestBody: { required: true },
          responses: { '201': { description: 'Created' } },
        },
      },
    },
  }

  localizeOpenApiDocument(document)

  assert.equal(document.tags[0].description, '微信消息收发、媒体和输入状态。')
  assert.equal(document.components.responses.Accepted.description, '请求已受理。')
  assert.equal(document.components.responses.NotFound.description, '请求的资源不存在。')
  assert.equal(document.paths['/api/v1/weixin/messages'].post.summary, 'Store')
  assert.equal(document.paths['/api/v1/weixin/messages'].post.description, 'Generated description')
  assert.equal(
    document.paths['/api/v1/weixin/messages'].post.responses['201'].description,
    '资源创建成功。'
  )
  assert.isTrue(document.paths['/api/v1/weixin/messages'].post.requestBody.required)
})

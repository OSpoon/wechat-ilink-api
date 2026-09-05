import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

const DEFAULT_REQUEST_LOG_MAX_BODY_BYTES = 64 * 1024
const MAX_LOG_DEPTH = 8

type RequestError = {
  name: string
  message: string
  stack?: string
  code?: string
}

/**
 * Writes one structured access log after every HTTP response.
 *
 * The middleware logs structured request and response data. Sensitive fields
 * are redacted, and uploaded/binary file contents are represented by metadata.
 */
export default class RequestLoggerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const startedAt = process.hrtime.bigint()
    const nativeResponse = ctx.response.response
    let logged = false
    let thrownError: unknown

    const writeLog = (completed: boolean) => {
      if (logged) return
      logged = true

      const statusCode = nativeResponse.statusCode
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000
      const requestId = ctx.request.id()
      const contentLength = nativeResponse.getHeader('content-length')
      const userAgent = ctx.request.header('user-agent')
      const userId = ctx.auth?.user?.id
      const accountId = ctx.request.param('accountId')
      const error = serializeError(thrownError)
      const requestBody = buildRequestBody(ctx)
      const responseBody = buildResponseBody(ctx)

      const fields = {
        event: 'http.request',
        requestId,
        method: ctx.request.method(),
        path: ctx.request.url(),
        route: ctx.route?.pattern,
        statusCode,
        durationMs: Number(durationMs.toFixed(2)),
        completed,
        clientIp: ctx.request.ip(),
        userAgent,
        userId,
        accountId,
        requestHeaders: sanitizeForLog(ctx.request.headers()),
        requestQuery: sanitizeForLog(ctx.request.qs()),
        requestContentType: ctx.request.header('content-type'),
        requestContentLength: ctx.request.header('content-length'),
        requestBodyType: ctx.request.bodyType,
        requestBody,
        responseHeaders: sanitizeForLog(ctx.response.getHeaders()),
        responseBody,
        responseContentLength: contentLength,
        error,
      }

      if (statusCode >= 500) {
        ctx.logger.error(fields, 'HTTP request completed')
      } else if (statusCode >= 400) {
        ctx.logger.warn(fields, 'HTTP request completed')
      } else {
        ctx.logger.info(fields, 'HTTP request completed')
      }
    }

    nativeResponse.once('finish', () => writeLog(true))
    nativeResponse.once('close', () => {
      if (!nativeResponse.writableFinished) writeLog(false)
    })

    try {
      return await next()
    } catch (error) {
      thrownError = error
      throw error
    } finally {
      if (nativeResponse.writableFinished) writeLog(true)
    }
  }
}

function buildRequestBody(ctx: HttpContext) {
  if (!env.get('REQUEST_LOG_BODY', true)) return undefined

  try {
    const body = ctx.request.body()
    if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
      return undefined
    }

    return limitForLog(sanitizeForLog(body))
  } catch {
    return undefined
  }
}

function buildResponseBody(ctx: HttpContext) {
  if (!env.get('REQUEST_LOG_BODY', true)) return undefined

  if (ctx.response.hasStream || ctx.response.hasFileToStream) {
    return {
      type: ctx.response.hasFileToStream ? 'file' : 'stream',
      note: 'binary response body is not logged',
    }
  }

  const content = ctx.response.content?.[0]
  if (content === undefined || content === null) return undefined

  return limitForLog(sanitizeForLog(content))
}

function limitForLog(value: unknown) {
  const serialized = JSON.stringify(value)
  const sizeBytes = Buffer.byteLength(serialized)
  const maxBytes = Math.max(
    1024,
    env.get('REQUEST_LOG_MAX_BODY_BYTES', DEFAULT_REQUEST_LOG_MAX_BODY_BYTES)
  )

  if (sizeBytes <= maxBytes) return value

  return {
    truncated: true,
    originalBytes: sizeBytes,
    preview: serialized.slice(0, maxBytes),
  }
}

function sanitizeForLog(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (depth > MAX_LOG_DEPTH) return '[MaxDepth]'
  if (value === null || value === undefined) return value
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'bigint') return value.toString()
  if (value instanceof Date) return value.toISOString()
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    return {
      type: 'binary',
      byteLength: value.byteLength,
    }
  }

  if (typeof value !== 'object') return String(value)

  if (isMultipartFile(value)) {
    return {
      type: 'multipart-file',
      fieldName: readStringProperty(value, 'fieldName'),
      clientName: readStringProperty(value, 'clientName'),
      size: readNumberProperty(value, 'size'),
      extname: readStringProperty(value, 'extname'),
      typeName: readStringProperty(value, 'type'),
      subtype: readStringProperty(value, 'subtype'),
      state: readStringProperty(value, 'state'),
      isValid: readBooleanProperty(value, 'isValid'),
    }
  }

  const toJson = (value as { toJSON?: unknown }).toJSON
  if (typeof toJson === 'function') {
    try {
      const jsonValue = toJson.call(value)
      if (jsonValue !== value) return sanitizeForLog(jsonValue, depth + 1, seen)
    } catch {
      // Fall through to a safe object traversal when toJSON fails.
    }
  }

  if (seen.has(value)) return '[Circular]'
  seen.add(value)

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLog(item, depth + 1, seen))
  }

  const result: Record<string, unknown> = {}
  for (const [key, nestedValue] of Object.entries(value)) {
    result[key] = isSensitiveKey(key) ? '[REDACTED]' : sanitizeForLog(nestedValue, depth + 1, seen)
  }
  return result
}

function isMultipartFile(value: object): boolean {
  return 'isMultipartFile' in value && value.isMultipartFile === true
}

function isSensitiveKey(key: string): boolean {
  const normalized = key.replace(/[-_]/g, '').toLowerCase()
  return [
    'authorization',
    'cookie',
    'setcookie',
    'password',
    'passwordconfirmation',
    'secret',
    'token',
    'signature',
    'aeskey',
    'filekey',
    'privatekey',
    'qrurl',
  ].some((part) => normalized.includes(part))
}

function readStringProperty(value: object, key: string): string | undefined {
  const property = (value as Record<string, unknown>)[key]
  return typeof property === 'string' ? property : undefined
}

function readNumberProperty(value: object, key: string): number | undefined {
  const property = (value as Record<string, unknown>)[key]
  return typeof property === 'number' ? property : undefined
}

function readBooleanProperty(value: object, key: string): boolean | undefined {
  const property = (value as Record<string, unknown>)[key]
  return typeof property === 'boolean' ? property : undefined
}

function serializeError(error: unknown): RequestError | undefined {
  if (!error) return undefined

  if (error instanceof Error) {
    const candidate = error as Error & { code?: unknown }
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(typeof candidate.code === 'string' ? { code: candidate.code } : {}),
    }
  }

  return {
    name: 'UnknownError',
    message: typeof error === 'string' ? error : 'Request failed',
  }
}

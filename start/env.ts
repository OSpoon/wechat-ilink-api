/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  TZ: Env.schema.string.optional(),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),
  REQUEST_LOG_BODY: Env.schema.boolean.optional(),
  REQUEST_LOG_MAX_BODY_BYTES: Env.schema.number.optional(),
  LIMITER_STORE: Env.schema.enum(['database', 'memory'] as const),
  ILINK_APP_ID: Env.schema.string(),
  ILINK_APP_CLIENT_VERSION: Env.schema.string(),
  ILINK_CHANNEL_VERSION: Env.schema.string(),
  ILINK_BOT_AGENT: Env.schema.string(),
  ILINK_BASE_URL: Env.schema.string(),
  ILINK_CDN_BASE_URL: Env.schema.string(),
  ILINK_BOT_TYPE: Env.schema.string(),
  DEFAULT_TEST_ACCOUNT_ENABLED: Env.schema.boolean.optional(),
  DEFAULT_TEST_ACCOUNT_EMAIL: Env.schema.string.optional(),
  DEFAULT_TEST_ACCOUNT_PASSWORD: Env.schema.string.optional(),
  DEFAULT_TEST_ACCOUNT_NAME: Env.schema.string.optional(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),
  MEDIA_STORAGE_PATH: Env.schema.string.optional(),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),
  DB_DATABASE: Env.schema.string(),
})

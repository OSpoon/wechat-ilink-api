import env from '#start/env'
import User from '#models/user'

const DEFAULT_EMAIL = 'test@example.com'
const DEFAULT_PASSWORD = 'test12345678'
const DEFAULT_FULL_NAME = 'Test Developer'

/**
 * Creates the development/test API user once so local verification can skip signup.
 * This deliberately does not create or bind a WeChat account.
 */
export async function ensureDefaultTestAccount() {
  if (env.get('NODE_ENV') === 'production') return null

  const enabled = env.get('DEFAULT_TEST_ACCOUNT_ENABLED', true)
  if (!enabled) return null

  const email = (env.get('DEFAULT_TEST_ACCOUNT_EMAIL', DEFAULT_EMAIL) || DEFAULT_EMAIL)
    .trim()
    .toLowerCase()
  const password = env.get('DEFAULT_TEST_ACCOUNT_PASSWORD', DEFAULT_PASSWORD) || DEFAULT_PASSWORD
  const fullName = env.get('DEFAULT_TEST_ACCOUNT_NAME', DEFAULT_FULL_NAME) || DEFAULT_FULL_NAME

  const existing = await User.findBy('email', email)
  if (existing) return existing

  return User.create({
    fullName: fullName.trim() || DEFAULT_FULL_NAME,
    email,
    password,
  })
}

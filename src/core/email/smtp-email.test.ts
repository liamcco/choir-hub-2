import { afterEach, describe, expect, test } from 'bun:test'
import { EmailClient } from './smtp-email'

const originalEnvironment = process.env.ENVIRONMENT
const originalVercelEnvironment = process.env.VERCEL_ENV
const originalUser = process.env.GMAIL_SMTP_USER
const originalPassword = process.env.GMAIL_SMTP_APP_PASSWORD

afterEach(() => {
  process.env.ENVIRONMENT = originalEnvironment
  process.env.VERCEL_ENV = originalVercelEnvironment
  process.env.GMAIL_SMTP_USER = originalUser
  process.env.GMAIL_SMTP_APP_PASSWORD = originalPassword
})

describe('email delivery configuration', () => {
  test('rejects SMTP outside production', () => {
    process.env.ENVIRONMENT = 'development'
    process.env.VERCEL_ENV = 'development'

    expect(() => EmailClient({ mode: 'smtp' })).toThrow('SMTP email is disabled outside production')
  })

  test('logs without creating an SMTP transport', async () => {
    const log = () => {}
    const client = EmailClient({ mode: 'log', logger: { log } })

    expect(await client.send({ to: 'member@example.com', subject: 'Test', text: 'Hello' })).toMatchObject({
      mode: 'log',
    })
  })
})

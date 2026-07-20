import { z } from 'zod'

const envSchema = z.object({
  ENVIRONMENT: z.enum(['development', 'production', 'test']).default('production'),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).default('development'),
  API_BASE_URL: z.url().default('http://localhost:3000'),
  SITE_URL: z.url().default('http://localhost:3000'),
  DATABASE_URL: z.string().default('postgresql://postgres:mysecretpassword@localhost:5432/csk_db'),
  BETTER_AUTH_URL: z.url().default('http://localhost:3000'),
  BETTER_AUTH_SECRET: z.string().default('78e45b6b57971eaf0cc7d08ead133ba7'),
  EMAIL_MODE: z.enum(['log', 'smtp']).default('log'),
  GMAIL_SMTP_USER: z.email().default('your.name@gmail.com'),
  GMAIL_SMTP_APP_PASSWORD: z.string().default('your-16-character-google-app-password'),
  LOG_PRISMA: z.enum(['true', 'false']).default('false'),
})
const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(z.treeifyError(parsed.error), null, 2))
  process.exit(1)
}
export const env = parsed.data

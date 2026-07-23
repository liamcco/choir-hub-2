import { passkey } from '@better-auth/passkey'
import { type BetterAuthOptions, betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { admin, emailOTP, openAPI, twoFactor, username } from 'better-auth/plugins'
import { env } from '@/core/config/env'
import { prisma } from '@/core/db'
import { EmailClient } from '@/core/email/smtp-email'
import { isProduction } from '@/core/environment/environment'
import { audit, logger } from '@/core/logging'
import { adminPluginOptions } from './permissions'

export const BASE_URL = env.BETTER_AUTH_URL
if (!BASE_URL) {
  throw new Error('BETTER_AUTH_URL is required')
}

const isSecureCookie = BASE_URL.startsWith('https://')

const emailClient = EmailClient()

export const authOptions = {
  appName: 'CSK Choir Hub Auth',
  baseURL: { allowedHosts: [BASE_URL, '*.vercel.app'] },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: isProduction,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await emailClient.send({
        to: user.email,
        subject: 'Reset Your Password',
        text: `You have requested to reset your password. Please click the link below to reset it:\n\n${url}\n\nIf you did not request this, please ignore this email.`,
      })

      logger.info('auth.password.reset.email.dispatched', { subjectUserId: user.id })
    },
    onPasswordReset: async ({ user }) => {
      audit.accountAccessChanged({ actorUserId: user.id, action: 'password.reset', subjectUserId: user.id })
    },
    revokeSessionsOnPasswordReset: true,
    onExistingUserSignUp: async () => {
      logger.warn('auth.signup.denied.existing-user')
    },
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      // Admin plugin fields (in schema order)
      role: 'user',
      banned: false,
      banReason: null,
      banExpires: null,
      // Your additional fields
      ...additionalFields,
      // ID must be last to match database output order
      id,
    }),
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 300, // 5 minutes
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: isSecureCookie,
    },
  },
  plugins: [
    username(),
    admin(adminPluginOptions),
    openAPI(),
    twoFactor(),
    passkey(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === 'sign-in') {
          await emailClient.send({
            to: email,
            subject: 'Your Sign-In OTP',
            text: `Your one-time password (OTP) for signing in is: ${otp}`,
          })

          logger.info('auth.otp.dispatched', { type })
        } else if (type === 'email-verification') {
          await emailClient.send({
            to: email,
            subject: 'Verify Your Email',
            text: `Please verify your email by entering the following OTP:\n\n${otp}\n\nIf you did not request this, please ignore this email.`,
          })

          logger.info('auth.otp.dispatched', { type })
        } else if (type === 'forget-password') {
          await emailClient.send({
            to: email,
            subject: 'Reset Your Password',
            text: `You have requested to reset your password. Please enter the following code to reset it:\n\n${otp}\n\nIf you did not request this, please ignore this email.`,
          })

          logger.info('auth.otp.dispatched', { type })
        } else {
          await emailClient.send({
            to: email,
            subject: 'Your OTP Code',
            text: `Your one-time password (OTP) is: ${otp}`,
          })

          logger.info('auth.otp.dispatched', { type })
        }
      },
    }),
    nextCookies(),
  ],
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await emailClient.send({
        to: user.email,
        subject: 'Verify Your Email',
        text: `Please verify your email by clicking the link below:\n\n${url}\n\nIf you did not request this, please ignore this email.`,
      })

      logger.info('auth.email-verification.dispatched', { subjectUserId: user.id })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 1 hour
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  experimental: {
    joins: true, // Enable database joins for better performance
  },
} satisfies BetterAuthOptions

export function createAuth() {
  return betterAuth(authOptions)
}

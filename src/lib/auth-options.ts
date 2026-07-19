import { passkey } from '@better-auth/passkey'
import { type BetterAuthOptions, betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { admin, emailOTP, openAPI, twoFactor, username } from 'better-auth/plugins'
import { isProduction } from '@/common/environment/environment'
import { prisma } from '@/db'
import { EmailClient } from '@/email/smtp-email'

export const BASE_URL = process.env.BETTER_AUTH_URL
if (!BASE_URL) {
  throw new Error('BETTER_AUTH_URL is required')
}

const isSecureCookie = BASE_URL.startsWith('https://')

const emailClient = EmailClient()

export const authOptions = {
  appName: 'CSK Choir Hub Auth',
  baseURL: BASE_URL,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: isProduction,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    sendResetPassword: async ({ user, url, token }) => {
      const result = await emailClient.send({
        to: user.email,
        subject: 'Reset Your Password',
        text: `You have requested to reset your password. Please click the link below to reset it:\n\n${url}\n\nIf you did not request this, please ignore this email.`,
      })

      console.log(`Send reset password email to ${user.email} with URL: ${url} and token: ${token}`)
      console.log(`Email send result: ${JSON.stringify(result)}`)
    },
    onPasswordReset: async ({ user }) => {
      // Handle any additional logic after a password reset, such as logging or notifications
      console.log(`Password reset for user: ${user.email}`)
    },
    revokeSessionsOnPasswordReset: true,
    onExistingUserSignUp: async ({ user }) => {
      // Handle the case where a user tries to sign up with an email that already exists
      console.log(`User with email ${user.email} already exists. Sign-up attempt blocked.`)
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
    admin(),
    openAPI(),
    twoFactor(),
    passkey(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === 'sign-in') {
          const result = await emailClient.send({
            to: email,
            subject: 'Your Sign-In OTP',
            text: `Your one-time password (OTP) for signing in is: ${otp}`,
          })

          console.log(`Email send result for sign-in OTP to ${email}: ${JSON.stringify(result)}`)
          console.log(`Sending OTP ${otp} to ${email} for sign-in`)
        } else if (type === 'email-verification') {
          const result = await emailClient.send({
            to: email,
            subject: 'Verify Your Email',
            text: `Please verify your email by entering the following OTP:\n\n${otp}\n\nIf you did not request this, please ignore this email.`,
          })

          console.log(`Email send result for email verification OTP to ${email}: ${JSON.stringify(result)}`)
          console.log(`Sending OTP ${otp} to ${email} for email verification`)
        } else if (type === 'forget-password') {
          const result = await emailClient.send({
            to: email,
            subject: 'Reset Your Password',
            text: `You have requested to reset your password. Please enter the following code to reset it:\n\n${otp}\n\nIf you did not request this, please ignore this email.`,
          })

          console.log(`Email send result for forget password OTP to ${email}: ${JSON.stringify(result)}`)
          console.log(`Password reset OTP for ${email}: ${otp}`)
        } else {
          const result = await emailClient.send({
            to: email,
            subject: 'Your OTP Code',
            text: `Your one-time password (OTP) is: ${otp}`,
          })

          console.log(`Email send result for OTP to ${email}: ${JSON.stringify(result)}`)
          console.log(`Sending OTP ${otp} to ${email} for ${type}`)
        }
      },
    }),
    nextCookies(),
  ],
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      const result = await emailClient.send({
        to: user.email,
        subject: 'Verify Your Email',
        text: `Please verify your email by clicking the link below:\n\n${url}\n\nIf you did not request this, please ignore this email.`,
      })

      console.log(`Send verification email to ${user.email} with URL: ${url} and token: ${token}`)
      console.log(`Email verification send result: ${JSON.stringify(result)}`)
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

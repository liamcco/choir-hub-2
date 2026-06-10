import { isProduction } from '@/lib/environment';
import { passkey } from '@better-auth/passkey';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin, emailOTP, openAPI, organization, twoFactor, username } from 'better-auth/plugins';

import { prisma } from '@/db';

const BASE_URL = process.env.BETTER_AUTH_URL;
if (!BASE_URL) {
  throw new Error('BETTER_AUTH_URL is required');
}

const isSecureCookie = BASE_URL.startsWith('https://');

export const auth = betterAuth({
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
      // Send reset password email
      console.log(`Send reset password email to ${user.email} with URL: ${url} and token: ${token}`);
    },
    onPasswordReset: async ({ user }) => {
      // Handle any additional logic after a password reset, such as logging or notifications
      console.log(`Password reset for user: ${user.email}`);
    },
    revokeSessionsOnPasswordReset: true,
    onExistingUserSignUp: async ({ user }) => {
      // Handle the case where a user tries to sign up with an email that already exists
      console.log(`User with email ${user.email} already exists. Sign-up attempt blocked.`);
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
    organization({
      teams: {
        enabled: true,
      },
    }),
    admin(),
    openAPI(),
    twoFactor(),
    passkey(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === 'sign-in') {
          // Send the OTP for sign in
          console.log(`Sending OTP ${otp} to ${email} for sign-in`);
        } else if (type === 'email-verification') {
          console.log(
            [
              `To: ${email}`,
              'Subject: Verify your CSK Choir Hub email',
              `Your verification code is ${otp}.`,
            ].join('\n'),
          );
        } else if (type === 'forget-password') {
          // Send the OTP for password reset
          console.log(`Password reset OTP for ${email}: ${otp}`);
        } else {
          console.log(`Sending OTP ${otp} to ${email} for ${type}`);
        }
      },
    }),
    nextCookies(),
  ],
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      // Send the verification email to the user with the provided URL and token
      console.log(`Send verification email to ${user.email} with URL: ${url} and token: ${token}`);
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
});

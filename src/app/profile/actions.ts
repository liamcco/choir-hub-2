'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { auth } from '@/lib/auth'

export type EmailVerificationState = {
  error?: string
  message?: string
  status: 'idle' | 'otp-sent' | 'verified' | 'error'
}

export type UsernameClaimState = {
  error?: string
  status: 'idle' | 'success' | 'error'
}

const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(32, 'Username must be at most 32 characters.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Use only letters, numbers, and underscores.'),
})

export async function requestEmailVerificationFormAction(): Promise<EmailVerificationState> {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })

  if (!session) {
    return { error: 'Sign in again to verify your email.', status: 'error' }
  }

  try {
    await auth.api.sendVerificationOTP({
      body: {
        email: session.user.email,
        type: 'email-verification',
      },
      headers: requestHeaders,
    })

    return { message: 'Verification code sent.', status: 'otp-sent' }
  } catch {
    return { error: 'Could not send a verification code.', status: 'error' }
  }
}

export async function verifyEmailOtpFormAction(
  _state: EmailVerificationState,
  formData: FormData,
): Promise<EmailVerificationState> {
  void _state

  const otp = formData.get('otp')
  if (typeof otp !== 'string' || otp.trim().length === 0) {
    return { error: 'Enter the verification code.', status: 'error' }
  }

  try {
    const requestHeaders = await headers()
    const session = await auth.api.getSession({
      headers: requestHeaders,
    })

    if (!session) {
      return { error: 'Sign in again to verify your email.', status: 'error' }
    }

    await auth.api.verifyEmailOTP({
      body: {
        email: session.user.email,
        otp: otp.trim(),
      },
      headers: requestHeaders,
    })

    revalidatePath('/profile')
    return { message: 'Email verified.', status: 'verified' }
  } catch {
    return { error: 'Invalid verification code.', status: 'error' }
  }
}

export async function claimUsernameFormAction(
  _state: UsernameClaimState,
  formData: FormData,
): Promise<UsernameClaimState> {
  void _state

  const parsed = usernameSchema.safeParse({
    username: formData.get('username'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Enter a valid username.', status: 'error' }
  }

  try {
    await auth.api.updateUser({
      body: {
        username: parsed.data.username,
      },
      headers: await headers(),
    })

    revalidatePath('/profile')
    return { status: 'success' }
  } catch {
    return { error: 'Could not set that username.', status: 'error' }
  }
}

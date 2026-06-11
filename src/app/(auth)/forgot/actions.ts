'use server'

import { auth } from '@/lib/auth'
import { z } from 'zod'

export type ForgotPasswordState = {
  step: 'email' | 'otp' | 'done'
  email?: string
  error?: string
}

const emailSchema = z.object({
  email: z.email(),
})

const resetSchema = z
  .object({
    email: z.email(),
    otp: z.string().min(1),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export async function requestPasswordResetAction(
  _state: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = emailSchema.safeParse({
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return {
      step: 'email',
      error: 'Enter a valid email address.',
    }
  }

  try {
    await auth.api.requestPasswordResetEmailOTP({
      body: {
        email: parsed.data.email,
      },
    })

    return {
      step: 'otp',
      email: parsed.data.email,
    }
  } catch {
    return {
      step: 'email',
      error: 'Could not send reset code.',
    }
  }
}

export async function resetPasswordAction(
  _state: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = resetSchema.safeParse({
    email: formData.get('email'),
    otp: formData.get('otp'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    return {
      step: 'otp',
      email: String(formData.get('email') ?? ''),
      error: 'Enter the code and a valid new password.',
    }
  }

  try {
    await auth.api.resetPasswordEmailOTP({
      body: {
        email: parsed.data.email,
        otp: parsed.data.otp,
        password: parsed.data.password,
      },
    })

    return {
      step: 'done',
      email: parsed.data.email,
    }
  } catch {
    return {
      step: 'otp',
      email: parsed.data.email,
      error: 'Invalid or expired reset code.',
    }
  }
}

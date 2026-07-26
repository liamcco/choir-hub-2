'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { auth } from '@/core/auth/auth'

export type ActivationState = { error?: string; success?: boolean }

export async function activateAccount(_state: ActivationState, formData: FormData): Promise<ActivationState> {
  const input = z.object({ password: z.string().min(8) }).safeParse({ password: formData.get('password') })
  if (!input.success) return { error: 'Use a password with at least 8 characters.' }
  try {
    await auth.api.setPassword({ headers: await headers(), body: { newPassword: input.data.password } })
    return { success: true }
  } catch {
    return { error: 'This activation link is invalid or has expired.' }
  }
}

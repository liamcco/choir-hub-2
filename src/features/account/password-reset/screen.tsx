'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useState } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { passwordPolicy } from '@/features/account/password-policy'
import { focusField } from '@/shared/forms/focus'
import { parseFormData } from '@/shared/forms/parsing'
import type { FormState } from '@/shared/forms/types'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { passwordResetRequestSchema, passwordResetSchema } from './schemas'
import { requestPasswordReset, resetPassword } from './service'

type PasswordResetRequestState = FormState<typeof passwordResetRequestSchema>
const initialState: PasswordResetRequestState = {}

export function PasswordResetRequestScreen() {
  const [email, setEmail] = useState('')

  async function submitRequest(
    _previousState: PasswordResetRequestState,
    formData: FormData,
  ): Promise<PasswordResetRequestState> {
    const validatedForm = parseFormData(passwordResetRequestSchema, formData)
    if (!validatedForm.success) {
      focusField('reset-email')
      return { fieldErrors: { email: ['Enter a valid email address.'] } }
    }

    const result = await requestPasswordReset(validatedForm.data.email)
    if (!result.success) {
      return { success: false, message: result.error }
    }

    return { success: true }
  }

  const [state, formAction, isPending] = useActionState(submitRequest, initialState)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl tracking-normal">Reset your password</h1>
          <p className="text-muted-foreground text-sm">
            Enter your account email and we&apos;ll send you a password reset link.
          </p>
        </div>
        {state.success ? (
          <div role="status" className="flex flex-col gap-4 text-sm">
            <p>If an account exists for that email, you&apos;ll receive a reset link shortly.</p>
            <Link href={ROUTES.login} className="underline underline-offset-4">
              Return to sign in
            </Link>
          </div>
        ) : (
          <form action={formAction} noValidate aria-busy={isPending} className="flex flex-col gap-4">
            <FieldGroup>
              <Field data-invalid={!!state.fieldErrors?.email?.[0]}>
                <FieldLabel htmlFor="reset-email">Email</FieldLabel>
                <Input
                  id="reset-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                  }}
                  data-invalid={!!state.fieldErrors?.email?.[0]}
                />
                <FieldError>{state.fieldErrors?.email?.[0]}</FieldError>
              </Field>
              <FieldError>{state.message}</FieldError>
            </FieldGroup>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Sending...' : 'Send reset link'}
            </Button>
            <Link href={ROUTES.login} className="text-center text-sm underline underline-offset-4">
              Return to sign in
            </Link>
          </form>
        )}
      </div>
    </main>
  )
}

type PasswordResetState = FormState<typeof passwordResetSchema>

export function PasswordResetScreen({ token }: { token?: string }) {
  const router = useRouter()
  const initialState: PasswordResetState = token
    ? {}
    : { success: false, message: 'This reset link is missing or invalid.' }

  async function submitReset(_previousState: PasswordResetState, formData: FormData): Promise<PasswordResetState> {
    if (!token) return { success: false, message: 'This reset link is missing or invalid.' }

    const validatedForm = parseFormData(passwordResetSchema, formData)
    if (!validatedForm.success) {
      focusField(validatedForm.fieldErrors.password ? 'reset-password' : 'reset-password-confirm')
      return { success: false, fieldErrors: validatedForm.fieldErrors }
    }

    const result = await resetPassword(token, validatedForm.data.password)
    if (!result.success) {
      return { success: false, message: result.error }
    }

    return { success: true }
  }

  const [state, formAction, isPending] = useActionState(submitReset, initialState)

  if (state.success) {
    return (
      <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center px-4 py-8">
        <div className="flex flex-col gap-4">
          <h1 className="font-semibold text-2xl tracking-normal">Password reset</h1>
          <p className="text-muted-foreground text-sm">Your password has been updated.</p>
          <Button type="button" onClick={() => router.replace(ROUTES.login)}>
            Return to sign in
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl tracking-normal">Choose a new password</h1>
          <p className="text-muted-foreground text-sm">{passwordPolicy.minPasswordLengthHint}</p>
        </div>
        <form action={formAction} noValidate aria-busy={isPending} className="flex flex-col gap-4">
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.password?.[0]}>
              <FieldLabel htmlFor="reset-password">New password</FieldLabel>
              <Input
                id="reset-password"
                name="password"
                type="password"
                autoComplete="new-password"
                data-invalid={!!state.fieldErrors?.password?.[0]}
              />
              <FieldError>{state.fieldErrors?.password?.[0]}</FieldError>
            </Field>
            <Field data-invalid={!!state.fieldErrors?.confirmPassword?.[0]}>
              <FieldLabel htmlFor="reset-password-confirm">Confirm new password</FieldLabel>
              <Input
                id="reset-password-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                data-invalid={!!state.fieldErrors?.confirmPassword?.[0]}
              />
              <FieldError>{state.fieldErrors?.confirmPassword?.[0]}</FieldError>
            </Field>
            <FieldError>{state.message}</FieldError>
          </FieldGroup>
          <Button type="submit" disabled={isPending || !token}>
            {isPending ? 'Updating...' : 'Update password'}
          </Button>
          <Link href={ROUTES.login} className="text-center text-sm underline underline-offset-4">
            Return to sign in
          </Link>
        </form>
      </div>
    </main>
  )
}

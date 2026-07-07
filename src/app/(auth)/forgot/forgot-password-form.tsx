'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { requestPasswordResetAction, resetPasswordAction } from './actions'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Spinner } from '@/components/ui/spinner'

const initialState = {
  step: 'email' as const,
}

export function ForgotPasswordForm() {
  const [requestState, requestAction, requestPending] = useActionState(requestPasswordResetAction, initialState)

  const [resetState, resetAction, resetPending] = useActionState(resetPasswordAction, requestState)

  const state = resetState.step !== 'email' ? resetState : requestState

  if (state.step === 'done') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-emerald-700">Password reset.</p>

        <Button className="w-full" nativeButton={false} render={<Link href="/login" />}>
          Back to sign in
        </Button>
      </div>
    )
  }

  if (state.step === 'otp') {
    return (
      <form action={resetAction} className="space-y-4">
        <input type="hidden" name="email" value={state.email} />

        <InputOTP name="otp" maxLength={6} required>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <FieldSet>
          <FieldLegend>Password</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel>New password</FieldLabel>
              <Input name="password" type="password" placeholder="New password" required />
            </Field>
            <Field>
              <FieldLabel>Confirm new password</FieldLabel>
              <Input name="confirmPassword" type="password" placeholder="Confirm new password" required />
            </Field>
          </FieldGroup>
        </FieldSet>
        {state.error && <FieldError>{state.error}</FieldError>}

        <Button disabled={resetPending} className="w-full" type="submit">
          {resetPending ? 'Resetting...' : 'Reset password'}
        </Button>
      </form>
    )
  }

  return (
    <form action={requestAction} className="space-y-4">
      <Input name="email" type="email" placeholder="Email" required />

      {state.error && <FieldError>{state.error}</FieldError>}

      <Button disabled={requestPending} className="w-full" type="submit">
        {requestPending ? (
          <>
            <Spinner /> Sending...
          </>
        ) : (
          <>Send reset code</>
        )}
      </Button>
    </form>
  )
}

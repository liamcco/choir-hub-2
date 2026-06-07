'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { requestPasswordResetAction, resetPasswordAction } from './actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

        <Input name="otp" placeholder="Reset code" required />
        <Input name="password" type="password" placeholder="New password" required />
        <Input name="confirmPassword" type="password" placeholder="Confirm new password" required />

        {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}

        <Button disabled={resetPending} className="w-full" type="submit">
          {resetPending ? 'Resetting...' : 'Reset password'}
        </Button>
      </form>
    )
  }

  return (
    <form action={requestAction} className="space-y-4">
      <Input name="email" type="email" placeholder="Email" required />

      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}

      <Button disabled={requestPending} className="w-full" type="submit">
        {requestPending ? 'Sending...' : 'Send reset code'}
      </Button>
    </form>
  )
}

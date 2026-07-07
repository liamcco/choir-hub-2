// fallow-ignore-file security-client-server-leak -- Next.js Server Actions are intentionally imported into client forms.
'use client'

import { MailCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import type { ReactNode } from 'react'

import {
  EmailVerificationState,
  requestEmailVerificationFormAction,
  verifyEmailOtpFormAction,
} from '@/app/profile/actions'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const initialState: EmailVerificationState = {
  status: 'idle',
}

export function EmailVerificationControls({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [requestState, requestAction, isRequesting] = useActionState(requestEmailVerificationFormAction, initialState)
  const [verifyState, verifyAction, isVerifying] = useActionState(verifyEmailOtpFormAction, requestState)
  const state = verifyState.status !== 'idle' ? verifyState : requestState
  const isPending = isRequesting || isVerifying

  useEffect(() => {
    if (state.status === 'verified') {
      router.refresh()
    }
  }, [router, state.status])

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {children}

        <form action={requestAction} className="shrink-0">
          <Button disabled={isPending || state.status === 'verified'} type="submit" variant="outline">
            {isRequesting ? (
              'Sending...'
            ) : (
              <>
                <MailCheck data-icon="inline-start" />
                Get Verified
              </>
            )}
          </Button>
        </form>
      </div>

      <VerificationFeedback error={state.error} message={state.message} />

      {state.status === 'otp-sent' ? (
        <form action={verifyAction} className="mt-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email-verification-otp">Verification code</FieldLabel>
              <Input
                autoComplete="one-time-code"
                id="email-verification-otp"
                inputMode="numeric"
                name="otp"
                placeholder="123456"
                required
              />
              <FieldDescription>The OTP is printed by the Better Auth email callback in the server logs.</FieldDescription>
            </Field>
          </FieldGroup>

          <Button className="mt-4 w-full sm:w-auto" disabled={isPending} type="submit">
            {isVerifying ? 'Verifying...' : 'Verify email'}
          </Button>
        </form>
      ) : null}
    </>
  )
}

function VerificationFeedback({ error, message }: { error?: string; message?: string }) {
  return (
    <>
      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <FieldError className="mt-3">{error}</FieldError> : null}
    </>
  )
}

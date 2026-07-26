'use client'

import { useActionState } from 'react'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { type ActivationState, activateAccount } from './actions'

export function ActivationForm({ token: _token }: { token?: string }) {
  const [state, action, pending] = useActionState<ActivationState, FormData>(activateAccount, {})
  if (state.success)
    return (
      <main className="mx-auto max-w-md space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Account activated</h1>
        <p>Your password is set. You can now sign in.</p>
        <a className="underline" href="/login">
          Go to sign in
        </a>
      </main>
    )
  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Activate your CSK account</h1>
        <p className="text-muted-foreground">Set a password to finish creating your account.</p>
      </header>
      <form action={action} className="space-y-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="activation-password">Password</FieldLabel>
            <Input id="activation-password" name="password" type="password" minLength={8} required />
            <FieldError>{state.error}</FieldError>
          </Field>
        </FieldGroup>
        <Button type="submit" disabled={pending}>
          {pending ? 'Activating' : 'Activate account'}
        </Button>
      </form>
    </main>
  )
}

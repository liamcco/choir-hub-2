// fallow-ignore-file security-client-server-leak -- Next.js Server Actions are intentionally imported into client forms.
'use client'

import { useActionState } from 'react'

import { claimUsernameFormAction, type UsernameClaimState } from '@/app/profile/actions'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const initialState: UsernameClaimState = {
  status: 'idle',
}

export function UsernameClaimForm() {
  const [state, action, pending] = useActionState(claimUsernameFormAction, initialState)

  return (
    <form action={action} className="rounded-lg border p-3">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input id="username" name="username" placeholder="username" required />
          <FieldError>{state.error}</FieldError>
        </Field>
      </FieldGroup>
      <Button className="mt-4" disabled={pending} type="submit">
        {pending ? 'Saving...' : 'Claim username'}
      </Button>
    </form>
  )
}

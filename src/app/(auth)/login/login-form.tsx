'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { signInWithCredentialsAction } from './actions'

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInWithCredentialsAction, {})

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input autoComplete="email" id="email" name="email" required type="email" />
        </Field>

        <Field>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link className="text-sm text-primary underline-offset-4 hover:underline" href="/forgot">
              Forgot password?
            </Link>
          </div>
          <Input autoComplete="current-password" id="password" name="password" required type="password" />
        </Field>
      </FieldGroup>

      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}

      <Button className="my-2 w-full" disabled={pending} type="submit" variant="default">
        {pending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}

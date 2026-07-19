'use client'

import { useActionState } from 'react'
import { changePasswordAction, type PasswordChangeFormState } from '@/account-self-service/actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { passwordChangePolicy } from './schemas'

const initialState: PasswordChangeFormState = {}

export function PasswordChangeForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={!!state.fieldErrors?.currentPassword}
          />
          <FieldError>{state.fieldErrors?.currentPassword}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="newPassword">New password</FieldLabel>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={passwordChangePolicy.minPasswordLength}
            required
            aria-invalid={!!state.fieldErrors?.newPassword}
          />
          <FieldDescription>{passwordChangePolicy.minPasswordLengthHint}</FieldDescription>
          <FieldError>{state.fieldErrors?.newPassword}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={passwordChangePolicy.minPasswordLength}
            required
            aria-invalid={!!state.fieldErrors?.confirmPassword}
          />
          <FieldError>{state.fieldErrors?.confirmPassword}</FieldError>
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-fit" disabled={isPending}>
        {isPending ? 'Updating password' : 'Update password'}
      </Button>
      {state.message ? (
        <Alert variant={state.success ? 'default' : 'destructive'}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  )
}

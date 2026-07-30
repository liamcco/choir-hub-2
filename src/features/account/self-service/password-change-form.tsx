'use client'

import { useActionState } from 'react'
import { passwordPolicy } from '@/features/account/password-policy'
import { changePasswordAction } from '@/features/account/self-service/actions'
import { FormMessageAlert } from '@/shared/forms/error-handling'
import { Button } from '@/shared/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

export function PasswordChangeForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, {})

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={!!state.fieldErrors?.currentPassword}>
          <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
          <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" />
          <FieldError>{state.fieldErrors?.currentPassword}</FieldError>
        </Field>
        <Field data-invalid={!!state.fieldErrors?.newPassword}>
          <FieldLabel htmlFor="newPassword">New password</FieldLabel>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={passwordPolicy.minPasswordLength}
          />
          <FieldDescription>{passwordPolicy.minPasswordLengthHint}</FieldDescription>
          <FieldError>{state.fieldErrors?.newPassword}</FieldError>
        </Field>
        <Field data-invalid={!!state.fieldErrors?.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={passwordPolicy.minPasswordLength}
          />
          <FieldError>{state.fieldErrors?.confirmPassword}</FieldError>
        </Field>
      </FieldGroup>
      <FormMessageAlert state={state} />
      <Button type="submit" className="w-fit" disabled={isPending}>
        {isPending ? 'Updating password' : 'Update password'}
      </Button>
    </form>
  )
}

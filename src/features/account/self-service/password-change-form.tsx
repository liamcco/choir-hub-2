'use client'

import { useActionState } from 'react'
import { passwordPolicy } from '@/core/auth/policy'
import { changePasswordAction } from '@/features/account/self-service/actions'
import { FormMessageAlert } from '@/shared/forms/error-handling'
import { useServerActionForm } from '@/shared/forms/tanstack'
import { Button } from '@/shared/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { PasswordChangeInputSchema } from './schemas'

export function PasswordChangeForm() {
  const [state, action, isPending] = useActionState(changePasswordAction, {})

  const form = useServerActionForm({
    schema: PasswordChangeInputSchema,
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    state,
  })

  return (
    <form
      action={action}
      onSubmit={() => {
        form.handleSubmit()
      }}
      aria-busy={isPending}
      className="flex flex-col gap-4"
    >
      <form.Field name="currentPassword">
        {(field) => {
          const isInvalid = !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Current password</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <FieldGroup>
        <form.Field name="newPassword">
          {(field) => {
            const isInvalid = !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="new-password"
                  minLength={passwordPolicy.minPasswordLength}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                />
                <FieldDescription>{passwordPolicy.minPasswordLengthHint}</FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
        <form.Field name="confirmPassword">
          {(field) => {
            const isInvalid = !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Confirm new password</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="new-password"
                  minLength={passwordPolicy.minPasswordLength}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </FieldGroup>
      <FormMessageAlert state={state} />
      <Button type="submit" className="w-fit" disabled={isPending || form.state.isSubmitting}>
        {isPending ? 'Updating password' : 'Update password'}
      </Button>
    </form>
  )
}

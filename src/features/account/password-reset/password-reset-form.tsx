'use client'

import { useForm } from '@tanstack/react-form'
import Link from 'next/link'
import { useState } from 'react'
import { passwordPolicy } from '@/core/auth/policy'
import { ROUTES } from '@/core/navigation/site'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { passwordResetSchema } from './schemas'
import { resetPassword } from './service'

const invalidResetLinkMessage = 'This reset link is missing or invalid.'

export function PasswordResetForm({ token, onSuccess }: { token?: string; onSuccess: () => void }) {
  const [formError, setFormError] = useState<string | null>(token ? null : invalidResetLinkMessage)

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: passwordResetSchema,
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        setFormError(invalidResetLinkMessage)
        return
      }

      setFormError(null)
      const result = await resetPassword(token, value.password)

      if (!result.success) {
        setFormError(result.error)
        return
      }

      onSuccess()
    },
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      noValidate
      aria-busy={form.state.isSubmitting}
      className="flex flex-col gap-4"
    >
      <FieldGroup>
        <form.Field name="password">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

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
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

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
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={form.state.isSubmitting || !token}>
        {form.state.isSubmitting ? 'Updating...' : 'Update password'}
      </Button>
      <Link href={ROUTES.login} className="text-center text-sm underline underline-offset-4">
        Return to sign in
      </Link>
    </form>
  )
}

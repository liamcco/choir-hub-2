'use client'

import { useForm } from '@tanstack/react-form'
import Link from 'next/link'
import { useState } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { passwordResetRequestSchema } from './schemas'
import { requestPasswordReset } from './service'

export function PasswordResetRequestForm({ onSuccess }: { onSuccess: () => void }) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: passwordResetRequestSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      const { email } = passwordResetRequestSchema.parse(value)
      const result = await requestPasswordReset(email)

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
      <form.Field name="email">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                autoComplete="email"
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
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={form.state.isSubmitting}>
        {form.state.isSubmitting ? 'Sending...' : 'Send reset link'}
      </Button>
      <Link href={ROUTES.login} className="text-center text-sm underline underline-offset-4">
        Return to sign in
      </Link>
    </form>
  )
}

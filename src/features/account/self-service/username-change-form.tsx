'use client'

import { useSelector } from '@tanstack/react-form-nextjs'
import { useActionState } from 'react'
import { changeUsernameAction } from '@/features/account/self-service/actions'
import { FormMessageAlert } from '@/shared/forms/error-handling'
import { useServerActionForm } from '@/shared/forms/tanstack'
import { Button } from '@/shared/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { UsernameChangeInputSchema } from './schemas'

export function UsernameChangeForm({ username }: { username?: string | null }) {
  const currentUsername = username ?? ''
  const [state, action, isPending] = useActionState(changeUsernameAction, {})
  const form = useServerActionForm({
    schema: UsernameChangeInputSchema,
    defaultValues: { username: currentUsername },
    state,
  })
  const formUsername = useSelector(form.store, (formState) => formState.values.username)
  const isUnchanged = formUsername === currentUsername

  return (
    <form action={action} onSubmit={() => form.handleSubmit()} aria-busy={isPending} className="flex flex-col gap-4">
      <form.Field name="username">
        {(field) => {
          const isInvalid = !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Username</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                autoComplete="username"
                aria-invalid={isInvalid}
              />
              <FieldDescription>Use 3-30 letters, numbers, underscores, or periods.</FieldDescription>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <FormMessageAlert state={state} />
      <Button type="submit" className="w-fit" disabled={isPending || form.state.isSubmitting || isUnchanged}>
        {isPending ? 'Updating username' : 'Update username'}
      </Button>
    </form>
  )
}

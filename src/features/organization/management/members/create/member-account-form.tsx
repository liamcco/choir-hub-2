'use client'

import { UserPlusIcon } from 'lucide-react'
import { useActionState, useEffect } from 'react'
import type { MemberStatus } from '@/drizzle/schema'
import { createUserAction, type UserFormState } from '@/features/organization/management/members/actions'
import { CreateMemberAccountFormSchema } from '@/features/organization/management/members/schemas'
import { FormMessageToast } from '@/shared/forms/error-handling'
import { useServerActionForm } from '@/shared/forms/tanstack'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'

const initialState: UserFormState = {}

export function MemberAccountForm({
  onCreated,
  onSuccess,
}: {
  onCreated?: (userId: string) => void
  onSuccess?: () => void
}) {
  const [state, formAction, isPending] = useActionState(createUserAction, initialState)
  const form = useServerActionForm({
    schema: CreateMemberAccountFormSchema,
    defaultValues: {
      name: '',
      email: '',
      status: 'ACTIVE',
    },
    state,
  })

  useEffect(() => {
    if (state.success) form.reset()
  }, [form, state.success])

  return (
    <form
      action={formAction}
      onSubmit={() => form.handleSubmit()}
      noValidate
      aria-busy={isPending || form.state.isSubmitting}
      className="flex flex-col gap-4"
    >
      <FieldGroup>
        <form.Field name="name">
          {(field) => {
            const isInvalid = !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  autoComplete="name"
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
        <form.Field name="email">
          {(field) => {
            const isInvalid = !field.state.meta.isValid
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
        <form.Field name="status">
          {(field) => {
            const isInvalid = !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Member Status</FieldLabel>
                <NativeSelect
                  id={field.name}
                  name={field.name}
                  className="w-full"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value as MemberStatus)}
                  aria-invalid={isInvalid}
                >
                  <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
                  <NativeSelectOption value="PASSIVE">Passive</NativeSelectOption>
                  <NativeSelectOption value="FORMER">Former</NativeSelectOption>
                </NativeSelect>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </FieldGroup>
      <Button type="submit" className="w-fit" disabled={isPending || form.state.isSubmitting}>
        <UserPlusIcon data-icon="inline-start" />
        {isPending ? 'Creating' : 'Create'}
      </Button>
      <FormMessageToast
        state={state}
        onSuccess={onSuccess}
        successAction={
          state.createdId && onCreated
            ? { label: 'View', onClick: () => onCreated(state.createdId as string) }
            : undefined
        }
      />
    </form>
  )
}

'use client'

import { UserPlusIcon } from 'lucide-react'
import { useActionState } from 'react'
import { createUserAction, type UserFormState } from '@/features/organization/management/members/actions'
import { FormMessage } from '@/shared/forms/error-handling'
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

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" name="name" autoComplete="name" required aria-invalid={!!state.fieldErrors?.name} />
          <FieldError>{state.fieldErrors?.name}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={!!state.fieldErrors?.email}
          />
          <FieldError>{state.fieldErrors?.email}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Temporary password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
            aria-invalid={!!state.fieldErrors?.password}
          />
          <FieldError>{state.fieldErrors?.password}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="status">Member Status</FieldLabel>
          <NativeSelect id="status" name="status" className="w-full" defaultValue="ACTIVE">
            <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
            <NativeSelectOption value="PASSIVE">Passive</NativeSelectOption>
            <NativeSelectOption value="FORMER">Former</NativeSelectOption>
          </NativeSelect>
          <FieldError>{state.fieldErrors?.status}</FieldError>
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-fit" disabled={isPending}>
        <UserPlusIcon data-icon="inline-start" />
        {isPending ? 'Creating' : 'Create'}
      </Button>
      <FormMessage
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

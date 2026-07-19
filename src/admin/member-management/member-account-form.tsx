'use client'

import { UserPlusIcon } from 'lucide-react'
import { useActionState } from 'react'
import { createMemberAccountAction, type MemberAccountFormState } from '@/admin/member-management/actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

const initialState: MemberAccountFormState = {}

export function MemberAccountForm() {
  const [state, formAction, isPending] = useActionState(createMemberAccountAction, initialState)

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
      {state.message ? (
        <Alert variant={state.success ? 'default' : 'destructive'}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  )
}

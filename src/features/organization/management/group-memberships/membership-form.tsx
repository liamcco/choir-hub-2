'use client'

import { SaveIcon, UserPlusIcon } from 'lucide-react'
import { useActionState } from 'react'

import { formatGroupName } from '@/features/organization/core/labels'
import { formatDateInput } from '@/shared/formatting'
import { FormMessageToast } from '@/shared/forms/error-handling'
import { useServerActionForm } from '@/shared/forms/tanstack'

import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'

import { createGroupMembershipAction, endGroupMembershipAction } from './actions'
import { CreateGroupMembershipFormSchema, EndGroupMembershipFormSchema } from './schemas'
import type { GroupMembershipPeriod, listGroupMembershipGroups, listGroupMembershipUsers } from './service'

export function CreateGroupMembershipForm({
  groups,
  users,
}: {
  groups: ReturnType<typeof listGroupMembershipGroups>
  users: Awaited<ReturnType<typeof listGroupMembershipUsers>>
}) {
  const [state, formAction, isPending] = useActionState(createGroupMembershipAction, {})
  const form = useServerActionForm({
    schema: CreateGroupMembershipFormSchema,
    defaultValues: { userId: '', groupId: '' },
    state,
  })

  return (
    <form action={formAction} onSubmit={() => form.handleSubmit()} noValidate className="flex flex-col gap-4">
      <FieldGroup>
        <form.Field name="userId">
          {(field) => {
            const isInvalid = !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="new-membership-user">User</FieldLabel>
                <NativeSelect
                  id="new-membership-user"
                  name={field.name}
                  className="w-full"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                >
                  <NativeSelectOption value="">Choose User</NativeSelectOption>
                  {users.map((option) => (
                    <NativeSelectOption key={option.user.id} value={option.user.id}>
                      {option.label} ({option.detail})
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
        <form.Field name="groupId">
          {(field) => {
            const isInvalid = !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="new-membership-group">Group</FieldLabel>
                <NativeSelect
                  id="new-membership-group"
                  name={field.name}
                  className="w-full"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                >
                  <NativeSelectOption value="">Choose Group</NativeSelectOption>
                  {groups.map((group) => (
                    <NativeSelectOption key={group.id} value={group.id}>
                      {formatGroupName(groups, group)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </FieldGroup>
      <Button type="submit" className="w-fit" disabled={isPending || form.state.isSubmitting}>
        <UserPlusIcon data-icon="inline-start" />
        {isPending ? 'Adding' : 'Add'}
      </Button>
      <FormMessageToast state={state} />
    </form>
  )
}

export function EndGroupMembershipForm({ membership }: { membership: GroupMembershipPeriod }) {
  const [state, formAction, isPending] = useActionState(endGroupMembershipAction.bind(null, membership.id), {})
  const form = useServerActionForm({
    schema: EndGroupMembershipFormSchema,
    defaultValues: { endsAt: '' },
    state,
  })

  return (
    <form
      action={formAction}
      onSubmit={() => form.handleSubmit()}
      noValidate
      className="flex min-w-44 items-start justify-end gap-2"
    >
      <form.Field name="endsAt">
        {(field) => {
          const isInvalid = !field.state.meta.isValid
          return (
            <div className="flex flex-col gap-1">
              <Input
                name={field.name}
                type="date"
                min={formatDateInput(membership.startsAt)}
                aria-label={`End ${membership.userLabel} membership in ${membership.group.name}`}
                aria-invalid={isInvalid}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
              <FormMessageToast state={state} />
            </div>
          )
        }}
      </form.Field>
      <Button
        type="submit"
        variant="outline"
        size="icon-sm"
        aria-label="Save end date"
        disabled={isPending || form.state.isSubmitting}
      >
        <SaveIcon />
      </Button>
    </form>
  )
}

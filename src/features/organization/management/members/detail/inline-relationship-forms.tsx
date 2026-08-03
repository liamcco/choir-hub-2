'use client'

import { useActionState } from 'react'
import { type GroupId, type PositionId, resolveGroup, resolvePosition } from '@/core/topology'
import { createGroupMembershipAction } from '@/features/organization/management/group-memberships/actions'
import { CreateGroupMembershipFormSchema } from '@/features/organization/management/group-memberships/schemas'
import { createPositionAssignmentAction } from '@/features/organization/management/position-assignments/actions'
import { CreatePositionAssignmentFormSchema } from '@/features/organization/management/position-assignments/schemas'
import { FormMessageToast } from '@/shared/forms/error-handling'
import { useServerActionForm } from '@/shared/forms/tanstack'
import type { EntityOption, NamedEntity } from '@/shared/types'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'

export function InlineMemberGroupMembershipForm({
  groups,
  userId,
  onSuccess,
}: {
  groups: NamedEntity<GroupId>[]
  userId: string
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(createGroupMembershipAction, {})
  const form = useServerActionForm({
    schema: CreateGroupMembershipFormSchema,
    defaultValues: { userId, groupId: '' },
    state,
  })

  return (
    <li className="p-4">
      <form
        action={formAction}
        onSubmit={() => form.handleSubmit()}
        noValidate
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <input name="userId" type="hidden" value={userId} />
        <form.Field name="groupId">
          {(field) => {
            const isInvalid = !field.state.meta.isValid
            return (
              <Field className="min-w-0 flex-1" data-invalid={isInvalid}>
                <FieldLabel htmlFor={`user-${userId}-inline-group`}>Group</FieldLabel>
                <NativeSelect
                  aria-invalid={isInvalid}
                  className="w-full"
                  id={`user-${userId}-inline-group`}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(resolveGroup(event.target.value)?.id ?? '')}
                >
                  <NativeSelectOption value="">Choose Group</NativeSelectOption>
                  {groups.map((group) => (
                    <NativeSelectOption key={group.id} value={group.id}>
                      {group.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
        <FormActions isPending={isPending || form.state.isSubmitting} onCancel={onSuccess} pendingLabel="Adding…" />
        <FormMessageToast onSuccess={onSuccess} state={state} />
      </form>
    </li>
  )
}

export function InlineMemberPositionAssignmentForm({
  positions,
  userId,
  onSuccess,
}: {
  positions: EntityOption<PositionId>[]
  userId: string
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(createPositionAssignmentAction, {})
  const form = useServerActionForm({
    schema: CreatePositionAssignmentFormSchema,
    defaultValues: { userId, positionId: '' },
    state,
  })

  return (
    <li className="p-4">
      <form
        action={formAction}
        onSubmit={() => form.handleSubmit()}
        noValidate
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <input name="userId" type="hidden" value={userId} />
        <form.Field name="positionId">
          {(field) => {
            const isInvalid = !field.state.meta.isValid
            return (
              <Field className="min-w-0 flex-1" data-invalid={isInvalid}>
                <FieldLabel htmlFor={`user-${userId}-inline-position`}>Position</FieldLabel>
                <NativeSelect
                  aria-invalid={isInvalid}
                  className="w-full"
                  id={`user-${userId}-inline-position`}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(resolvePosition(event.target.value)?.id ?? '')}
                >
                  <NativeSelectOption value="">Choose Position</NativeSelectOption>
                  {positions.map((position) => (
                    <NativeSelectOption key={position.id} value={position.id}>
                      {position.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
        <FormActions isPending={isPending || form.state.isSubmitting} onCancel={onSuccess} pendingLabel="Assigning…" />
        <FormMessageToast onSuccess={onSuccess} state={state} />
      </form>
    </li>
  )
}

function FormActions({
  isPending,
  onCancel,
  pendingLabel,
}: {
  isPending: boolean
  onCancel: () => void
  pendingLabel: string
}) {
  return (
    <div className="flex shrink-0 gap-2">
      <Button onClick={onCancel} type="button" variant="ghost">
        Cancel
      </Button>
      <Button disabled={isPending} type="submit">
        {isPending ? pendingLabel : 'Confirm'}
      </Button>
    </div>
  )
}

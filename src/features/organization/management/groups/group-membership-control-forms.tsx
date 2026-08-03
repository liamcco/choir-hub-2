'use client'

import { SaveIcon } from 'lucide-react'
import { useActionState } from 'react'
import { type GroupId, resolveGroup } from '@/core/topology'
import {
  createGroupMembershipAction,
  endGroupMembershipAction,
} from '@/features/organization/management/group-memberships/actions'
import {
  CreateGroupMembershipFormSchema,
  EndGroupMembershipFormSchema,
} from '@/features/organization/management/group-memberships/schemas'
import { formatDateInput } from '@/shared/formatting'
import { FormMessageToast } from '@/shared/forms/error-handling'
import { useServerActionForm } from '@/shared/forms/tanstack'
import type { NamedEntity } from '@/shared/types'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'

export function AddUserGroupForm({
  userId,
  groups,
  onCancel,
}: {
  userId: string
  groups: NamedEntity<GroupId>[]
  onCancel: () => void
}) {
  const [state, formAction, isPending] = useActionState(createGroupMembershipAction, {})
  const form = useServerActionForm({
    schema: CreateGroupMembershipFormSchema,
    defaultValues: { userId, groupId: '' },
    state,
  })

  return (
    <form
      action={formAction}
      onSubmit={() => form.handleSubmit()}
      noValidate
      className="space-y-4 rounded-lg border bg-muted/20 p-4"
    >
      <input name="userId" type="hidden" value={form.state.values.userId} />
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-medium">Add Group Membership</h3>
        <Button onClick={onCancel} size="sm" type="button" variant="ghost">
          Cancel
        </Button>
      </div>
      <FieldGroup className="sm:grid sm:grid-cols-2">
        <form.Field name="groupId">
          {(field) => {
            const isInvalid = !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={`user-${userId}-group`}>Group</FieldLabel>
                <NativeSelect
                  aria-invalid={isInvalid}
                  className="w-full"
                  id={`user-${userId}-group`}
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
      </FieldGroup>
      <Button disabled={isPending || form.state.isSubmitting} type="submit">
        {isPending ? 'Adding' : 'Add Membership'}
      </Button>
      <FormMessageToast state={state} />
    </form>
  )
}

export function EndGroupMembershipForm({
  membership,
  groupName,
  onCancel,
}: {
  membership: { id: string; groupId: GroupId; userId: string; userLabel: string; startsAt: Date }
  groupName: string
  onCancel: () => void
}) {
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
      className="flex flex-col items-start gap-2 sm:items-end"
    >
      <input name="groupId" type="hidden" value={membership.groupId} />
      <input name="userId" type="hidden" value={membership.userId} />
      <div className="flex items-start gap-2">
        <form.Field name="endsAt">
          {(field) => {
            const isInvalid = !field.state.meta.isValid
            return (
              <div className="flex flex-col gap-1">
                <Input
                  aria-invalid={isInvalid}
                  aria-label={`End ${membership.userLabel} membership in ${groupName}`}
                  min={formatDateInput(membership.startsAt)}
                  name={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </div>
            )
          }}
        </form.Field>
        <Button
          aria-label="Save end date"
          disabled={isPending || form.state.isSubmitting}
          size="icon-sm"
          type="submit"
          variant="outline"
        >
          <SaveIcon />
        </Button>
        <Button onClick={onCancel} size="sm" type="button" variant="ghost">
          Cancel
        </Button>
      </div>
      <FormMessageToast state={state} />
    </form>
  )
}

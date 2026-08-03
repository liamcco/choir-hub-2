'use client'

import { useActionState } from 'react'
import type { GroupId } from '@/core/topology'
import type { UserDisplayOption } from '@/features/organization/core/labels'
import { UserCombobox } from '@/features/organization/management/components/user-combobox'
import { createGroupMembershipAction } from '@/features/organization/management/group-memberships/actions'
import { CreateGroupMembershipFormSchema } from '@/features/organization/management/group-memberships/schemas'
import { FormMessageToast } from '@/shared/forms/error-handling'
import { useServerActionForm } from '@/shared/forms/tanstack'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'

export function InlineGroupMembershipForm({
  groupId,
  users,
  onSuccess,
}: {
  groupId: GroupId
  users: UserDisplayOption[]
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(createGroupMembershipAction, {})
  const form = useServerActionForm({
    schema: CreateGroupMembershipFormSchema,
    defaultValues: { groupId, userId: '' },
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
        <input name="groupId" type="hidden" value={groupId} />
        <form.Field name="userId">
          {(field) => {
            const isInvalid = !field.state.meta.isValid
            return (
              <Field className="min-w-0 flex-1" data-invalid={isInvalid}>
                <FieldLabel htmlFor={`group-${groupId}-user`}>User</FieldLabel>
                <UserCombobox
                  id={`group-${groupId}-user`}
                  invalid={isInvalid}
                  name={field.name}
                  users={users}
                  value={field.state.value}
                  onValueChange={field.handleChange}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
        <div className="flex shrink-0 gap-2">
          <Button onClick={onSuccess} type="button" variant="ghost">
            Cancel
          </Button>
          <Button disabled={isPending || form.state.isSubmitting} type="submit">
            {isPending ? 'Adding…' : 'Confirm'}
          </Button>
        </div>
        <FormMessageToast onSuccess={onSuccess} state={state} />
      </form>
    </li>
  )
}

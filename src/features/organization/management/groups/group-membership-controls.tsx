'use client'

import { SaveIcon, UserPlusIcon } from 'lucide-react'
import { useActionState, useState } from 'react'
import type {
  CreateGroupMembershipAction,
  CreateGroupMembershipFormState,
  EndGroupMembershipAction,
  EndGroupMembershipFormState,
} from '@/features/organization/management/group-memberships/actions'
import { formatDateInput } from '@/shared/formatting'
import { FormMessage } from '@/shared/forms/error-handling'
import type { NamedEntity } from '@/shared/types'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'

const createInitialState: CreateGroupMembershipFormState = {}
const endInitialState: EndGroupMembershipFormState = {}
export type CreateMembershipAction = CreateGroupMembershipAction
export type EndMembershipAction = EndGroupMembershipAction

export function AddUserGroupControl({
  userId,
  groups,
  action,
}: {
  userId: string
  groups: NamedEntity[]
  action: CreateMembershipAction
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(action, createInitialState)

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} type="button" variant="outline">
        <UserPlusIcon data-icon="inline-start" />
        Add Group
      </Button>
    )
  }

  return (
    <form action={formAction} className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <input name="userId" type="hidden" value={userId} />
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-medium">Add Group Membership</h3>
        <Button onClick={() => setIsOpen(false)} size="sm" type="button" variant="ghost">
          Cancel
        </Button>
      </div>
      <FieldGroup className="sm:grid sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`user-${userId}-group`}>Group</FieldLabel>
          <NativeSelect
            aria-invalid={!!state.fieldErrors?.groupId}
            className="w-full"
            id={`user-${userId}-group`}
            name="groupId"
            required
          >
            <NativeSelectOption value="">Choose Group</NativeSelectOption>
            {groups.map((group) => (
              <NativeSelectOption key={group.id} value={group.id}>
                {group.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{state.fieldErrors?.groupId}</FieldError>
        </Field>
      </FieldGroup>
      <Button disabled={isPending} type="submit">
        {isPending ? 'Adding' : 'Add Membership'}
      </Button>
      <FormMessage state={state} />
    </form>
  )
}

export function EndGroupUserControl({
  membership,
  groupName,
  action,
}: {
  membership: { id: string; groupId: string; userId: string; userLabel: string; startsAt: Date }
  groupName: string
  action: EndMembershipAction
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(action.bind(null, membership.id), endInitialState)

  if (!isOpen) {
    return (
      <Button
        aria-label={`End ${membership.userLabel} membership`}
        onClick={() => setIsOpen(true)}
        size="sm"
        type="button"
        variant="outline"
      >
        End
      </Button>
    )
  }

  return (
    <form action={formAction} className="flex flex-col items-start gap-2 sm:items-end">
      <input name="groupId" type="hidden" value={membership.groupId} />
      <input name="userId" type="hidden" value={membership.userId} />
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-1">
          <Input
            aria-invalid={!!state.fieldErrors?.endsAt}
            aria-label={`End ${membership.userLabel} membership in ${groupName}`}
            min={formatDateInput(membership.startsAt)}
            name="endsAt"
            required
            type="date"
          />
          <FieldError>{state.fieldErrors?.endsAt}</FieldError>
        </div>
        <Button aria-label="Save end date" disabled={isPending} size="icon-sm" type="submit" variant="outline">
          <SaveIcon />
        </Button>
        <Button onClick={() => setIsOpen(false)} size="sm" type="button" variant="ghost">
          Cancel
        </Button>
      </div>
      <FormMessage state={state} />
    </form>
  )
}

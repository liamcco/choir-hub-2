'use client'

import { SaveIcon, UserPlusIcon } from 'lucide-react'
import { useActionState } from 'react'

import { formatGroupPath } from '@/features/organization/core/labels'
import { formatDateInput } from '@/shared/formatting'
import { FormMessage } from '@/shared/forms/error-handling'

import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'

import {
  type CreateGroupMembershipFormState,
  createGroupMembershipAction,
  type EndGroupMembershipFormState,
  endGroupMembershipAction,
} from './actions'
import type { GroupMembershipManagementState, GroupMembershipPeriod } from './service'

const createInitialState: CreateGroupMembershipFormState = {}
const endInitialState: EndGroupMembershipFormState = {}

export function CreateGroupMembershipForm({ groups, users }: Pick<GroupMembershipManagementState, 'groups' | 'users'>) {
  const [state, formAction, isPending] = useActionState(createGroupMembershipAction, createInitialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="new-membership-user">User</FieldLabel>
          <NativeSelect
            id="new-membership-user"
            name="userId"
            required
            className="w-full"
            aria-invalid={!!state.fieldErrors?.userId}
          >
            <NativeSelectOption value="">Choose User</NativeSelectOption>
            {users.map((option) => (
              <NativeSelectOption key={option.user.id} value={option.user.id}>
                {option.label} ({option.detail})
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{state.fieldErrors?.userId}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="new-membership-group">Group</FieldLabel>
          <NativeSelect
            id="new-membership-group"
            name="groupId"
            required
            className="w-full"
            aria-invalid={!!state.fieldErrors?.groupId}
          >
            <NativeSelectOption value="">Choose Group</NativeSelectOption>
            {groups.map((group) => (
              <NativeSelectOption key={group.id} value={group.id}>
                {formatGroupPath(groups, group)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{state.fieldErrors?.groupId}</FieldError>
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-fit" disabled={isPending}>
        <UserPlusIcon data-icon="inline-start" />
        {isPending ? 'Adding' : 'Add'}
      </Button>
      <FormMessage state={state} />
    </form>
  )
}

export function EndGroupMembershipForm({ membership }: { membership: GroupMembershipPeriod }) {
  const [state, formAction, isPending] = useActionState(
    endGroupMembershipAction.bind(null, membership.id),
    endInitialState,
  )

  return (
    <form action={formAction} className="flex min-w-44 items-start justify-end gap-2">
      <div className="flex flex-col gap-1">
        <Input
          name="endsAt"
          type="date"
          min={formatDateInput(membership.startsAt)}
          aria-label={`End ${membership.userLabel} membership in ${membership.group.name}`}
          aria-invalid={!!state.fieldErrors?.endsAt}
          required
        />
        <FieldError>{state.fieldErrors?.endsAt}</FieldError>
        <FormMessage state={state} />
      </div>
      <Button type="submit" variant="outline" size="icon-sm" aria-label="Save end date" disabled={isPending}>
        <SaveIcon />
      </Button>
    </form>
  )
}

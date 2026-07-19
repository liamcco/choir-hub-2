'use client'

import { SaveIcon, UserPlusIcon } from 'lucide-react'
import { useActionState } from 'react'
import { formatGroupPath } from '@/admin/group-management/group-labels'
import type { GroupMembershipFormState } from '@/admin/group-membership-management/actions'
import { createGroupMembershipAction, endGroupMembershipAction } from '@/admin/group-membership-management/actions'
import type { GroupMembershipManagementState, GroupMembershipPeriod } from '@/admin/group-membership-management/service'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

const initialState: GroupMembershipFormState = {}

export function CreateGroupMembershipForm({
  groups,
  members,
}: Pick<GroupMembershipManagementState, 'groups' | 'members'>) {
  const [state, formAction, isPending] = useActionState(createGroupMembershipAction, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="new-membership-member">Member</FieldLabel>
          <NativeSelect
            id="new-membership-member"
            name="memberId"
            required
            className="w-full"
            aria-invalid={!!state.fieldErrors?.memberId}
          >
            <NativeSelectOption value="">Choose Member</NativeSelectOption>
            {members.map((option) => (
              <NativeSelectOption key={option.member.id} value={option.member.id}>
                {option.label} ({option.detail})
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{state.fieldErrors?.memberId}</FieldError>
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
        <Field>
          <FieldLabel htmlFor="new-membership-starts-at">Start date</FieldLabel>
          <Input
            id="new-membership-starts-at"
            name="startsAt"
            type="date"
            required
            aria-invalid={!!state.fieldErrors?.startsAt}
          />
          <FieldError>{state.fieldErrors?.startsAt}</FieldError>
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
    initialState,
  )

  return (
    <form action={formAction} className="flex min-w-44 items-start justify-end gap-2">
      <div className="flex flex-col gap-1">
        <Input
          name="endsAt"
          type="date"
          min={formatDateInput(membership.startsAt)}
          aria-label={`End ${membership.memberLabel} membership in ${membership.group.name}`}
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

function FormMessage({ state }: { state: GroupMembershipFormState }) {
  if (!state.message) {
    return null
  }

  return (
    <p className={state.fieldErrors ? 'text-destructive text-sm' : 'text-muted-foreground text-sm'}>{state.message}</p>
  )
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

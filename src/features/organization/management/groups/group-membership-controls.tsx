'use client'

import { SaveIcon, UserPlusIcon } from 'lucide-react'
import { useActionState, useState } from 'react'
import type { MemberLabel } from '@/features/organization/core/labels'
import type {
  CreateGroupMembershipFormState,
  EndGroupMembershipFormState,
} from '@/features/organization/management/group-memberships/actions'
import { formatDateInput } from '@/shared/formatting'
import { FormMessage } from '@/shared/forms/error-handling'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'

const createInitialState: CreateGroupMembershipFormState = {}
const endInitialState: EndGroupMembershipFormState = {}
export type CreateMembershipAction = (
  previousState: CreateGroupMembershipFormState,
  formData: FormData,
) => Promise<CreateGroupMembershipFormState>
export type EndMembershipAction = (
  membershipId: string,
  previousState: EndGroupMembershipFormState,
  formData: FormData,
) => Promise<EndGroupMembershipFormState>

export function AddGroupMemberControl({
  groupId,
  members,
  action,
}: {
  groupId: string
  members: MemberLabel[]
  action: CreateMembershipAction
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(action, createInitialState)

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} type="button" variant="outline">
        <UserPlusIcon data-icon="inline-start" />
        Add Member
      </Button>
    )
  }

  return (
    <form action={formAction} className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <input name="groupId" type="hidden" value={groupId} />
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-medium">Add Group Membership</h3>
        <Button onClick={() => setIsOpen(false)} size="sm" type="button" variant="ghost">
          Cancel
        </Button>
      </div>
      <FieldGroup className="sm:grid sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`group-${groupId}-member`}>Member</FieldLabel>
          <NativeSelect
            aria-invalid={!!state.fieldErrors?.memberId}
            className="w-full"
            id={`group-${groupId}-member`}
            name="memberId"
            required
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
          <FieldLabel htmlFor={`group-${groupId}-starts-at`}>Start date</FieldLabel>
          <Input
            aria-invalid={!!state.fieldErrors?.startsAt}
            id={`group-${groupId}-starts-at`}
            name="startsAt"
            required
            type="date"
          />
          <FieldError>{state.fieldErrors?.startsAt}</FieldError>
        </Field>
      </FieldGroup>
      <Button disabled={isPending} type="submit">
        {isPending ? 'Adding' : 'Add Membership'}
      </Button>
      <FormMessage state={state} />
    </form>
  )
}

export function EndGroupMemberControl({
  membership,
  groupName,
  action,
}: {
  membership: { id: string; groupId: string; memberLabel: string; startsAt: Date }
  groupName: string
  action: EndMembershipAction
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(action.bind(null, membership.id), endInitialState)

  if (!isOpen) {
    return (
      <Button
        aria-label={`End ${membership.memberLabel} membership`}
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
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-1">
          <Input
            aria-invalid={!!state.fieldErrors?.endsAt}
            aria-label={`End ${membership.memberLabel} membership in ${groupName}`}
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

'use client'

import { SaveIcon, UserRoundCheckIcon } from 'lucide-react'
import { useActionState } from 'react'
import type {
  CreatePositionAssignmentFormState,
  EndPositionAssignmentFormState,
} from '@/features/organization/management/position-assignments/actions'
import {
  createPositionAssignmentAction,
  endPositionAssignmentAction,
} from '@/features/organization/management/position-assignments/actions'
import type {
  PositionAssignmentManagementState,
  PositionAssignmentPeriod,
} from '@/features/organization/management/position-assignments/service'
import { formatDateInput } from '@/shared/formatting'
import { FormMessage } from '@/shared/forms/error-handling'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'

const createInitialState: CreatePositionAssignmentFormState = {}
const endInitialState: EndPositionAssignmentFormState = {}

export function CreatePositionAssignmentForm({
  members,
  positions,
}: Pick<PositionAssignmentManagementState, 'members' | 'positions'>) {
  const [state, formAction, isPending] = useActionState(createPositionAssignmentAction, createInitialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="new-assignment-position">Position</FieldLabel>
          <NativeSelect
            id="new-assignment-position"
            name="positionId"
            required
            className="w-full"
            aria-invalid={!!state.fieldErrors?.positionId}
          >
            <NativeSelectOption value="">Choose Position</NativeSelectOption>
            {positions.map((option) => (
              <NativeSelectOption key={option.position.id} value={option.position.id}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{state.fieldErrors?.positionId}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="new-assignment-member">Member</FieldLabel>
          <NativeSelect
            id="new-assignment-member"
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
          <FieldLabel htmlFor="new-assignment-starts-at">Start date</FieldLabel>
          <Input
            id="new-assignment-starts-at"
            name="startsAt"
            type="date"
            required
            aria-invalid={!!state.fieldErrors?.startsAt}
          />
          <FieldError>{state.fieldErrors?.startsAt}</FieldError>
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-fit" disabled={isPending}>
        <UserRoundCheckIcon data-icon="inline-start" />
        {isPending ? 'Assigning' : 'Assign'}
      </Button>
      <FormMessage state={state} />
    </form>
  )
}

export function EndPositionAssignmentForm({ assignment }: { assignment: PositionAssignmentPeriod }) {
  const [state, formAction, isPending] = useActionState(
    endPositionAssignmentAction.bind(null, assignment.id),
    endInitialState,
  )

  return (
    <form action={formAction} className="flex min-w-44 items-start justify-end gap-2">
      <div className="flex flex-col gap-1">
        <Input
          name="endsAt"
          type="date"
          min={formatDateInput(assignment.startsAt)}
          aria-label={`End ${assignment.memberLabel} assignment to ${assignment.position.name}`}
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

'use client'

import { SaveIcon, UserRoundCheckIcon } from 'lucide-react'
import { useActionState, useState } from 'react'
import type { UserLabel } from '@/features/organization/core/labels'
import type {
  CreatePositionAssignmentFormState,
  EndPositionAssignmentFormState,
} from '@/features/organization/management/position-assignments/actions'
import {
  createPositionAssignmentAction,
  endPositionAssignmentAction,
} from '@/features/organization/management/position-assignments/actions'
import type { PositionAssignmentManagementState } from '@/features/organization/management/position-assignments/service'
import { formatDateInput } from '@/shared/formatting'
import { FormMessage } from '@/shared/forms/error-handling'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'

const createInitialState: CreatePositionAssignmentFormState = {}
const endInitialState: EndPositionAssignmentFormState = {}
type UserOptions = UserLabel[]
type AssignmentForEnd = { id: string; userId: string; startsAt: Date; userLabel: string }
type CreateAssignmentAction = (
  previousState: CreatePositionAssignmentFormState,
  formData: FormData,
) => Promise<CreatePositionAssignmentFormState>
type EndAssignmentAction = (
  assignmentId: string,
  previousState: EndPositionAssignmentFormState,
  formData: FormData,
) => Promise<EndPositionAssignmentFormState>

export function CreatePositionAssignmentForm({
  users,
  positions,
}: {
  users: UserOptions
  positions: PositionAssignmentManagementState['positions']
}) {
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
          <FieldLabel htmlFor="new-assignment-user">User</FieldLabel>
          <NativeSelect
            id="new-assignment-user"
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
      </FieldGroup>
      <Button type="submit" className="w-fit" disabled={isPending}>
        <UserRoundCheckIcon data-icon="inline-start" />
        {isPending ? 'Assigning' : 'Assign'}
      </Button>
      <FormMessage state={state} />
    </form>
  )
}

export function AssignPositionHolderControl({ users, positionId }: { users: UserOptions; positionId: string }) {
  const [isAssigning, setIsAssigning] = useState(false)
  if (!isAssigning) {
    return (
      <Button onClick={() => setIsAssigning(true)} type="button" variant="outline">
        Assign holder
      </Button>
    )
  }
  return <AssignPositionHolderForm users={users} positionId={positionId} onCancel={() => setIsAssigning(false)} />
}

export function AssignUserPositionControl({
  userId,
  positions,
  action = createPositionAssignmentAction,
}: {
  userId: string
  positions: { id: string; label: string }[]
  action?: CreateAssignmentAction
}) {
  const [isAssigning, setIsAssigning] = useState(false)
  const [state, formAction, isPending] = useActionState(action, createInitialState)
  if (!isAssigning)
    return (
      <Button onClick={() => setIsAssigning(true)} type="button" variant="outline">
        Assign Position
      </Button>
    )

  return (
    <form action={formAction} className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <input name="userId" type="hidden" value={userId} />
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-medium">Assign Position</h3>
        <Button onClick={() => setIsAssigning(false)} size="sm" type="button" variant="ghost">
          Cancel
        </Button>
      </div>
      <FieldGroup className="sm:grid sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`user-${userId}-position`}>Position</FieldLabel>
          <NativeSelect
            aria-invalid={!!state.fieldErrors?.positionId}
            className="w-full"
            id={`user-${userId}-position`}
            name="positionId"
            required
          >
            <NativeSelectOption value="">Choose Position</NativeSelectOption>
            {positions.map((position) => (
              <NativeSelectOption key={position.id} value={position.id}>
                {position.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{state.fieldErrors?.positionId}</FieldError>
        </Field>
      </FieldGroup>
      <Button disabled={isPending} type="submit">
        {isPending ? 'Assigning' : 'Assign'}
      </Button>
      <FormMessage state={state} />
    </form>
  )
}

function AssignPositionHolderForm({
  users,
  positionId,
  onCancel,
}: {
  users: UserOptions
  positionId: string
  onCancel: () => void
}) {
  const [state, formAction, isPending] = useActionState(createPositionAssignmentAction, createInitialState)
  return (
    <form
      action={formAction}
      className="grid gap-3 rounded-lg border bg-muted/20 p-4 sm:grid-cols-[minmax(12rem,1fr)_auto_auto] sm:items-end"
    >
      <input name="positionId" type="hidden" value={positionId} />
      <Field>
        <FieldLabel htmlFor={`assignment-user-${positionId}`}>User</FieldLabel>
        <NativeSelect
          id={`assignment-user-${positionId}`}
          name="userId"
          required
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
      <div className="flex gap-2">
        <Button disabled={isPending} type="submit">
          {isPending ? 'Assigning' : 'Assign'}
        </Button>
        <Button onClick={onCancel} type="button" variant="ghost">
          Cancel
        </Button>
      </div>
      <FormMessage state={state} />
    </form>
  )
}

export function EndPositionAssignmentForm({
  assignment,
  action = endPositionAssignmentAction,
}: {
  assignment: AssignmentForEnd & {
    position: { name: string }
  }
  action?: EndAssignmentAction
}) {
  const [state, formAction, isPending] = useActionState(action.bind(null, assignment.id), endInitialState)

  return (
    <form action={formAction} className="flex min-w-44 items-start justify-end gap-2">
      <input name="userId" type="hidden" value={assignment.userId} />
      <div className="flex flex-col gap-1">
        <Input
          name="endsAt"
          type="date"
          min={formatDateInput(assignment.startsAt)}
          aria-label={`End ${assignment.userLabel} assignment to ${assignment.position.name}`}
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

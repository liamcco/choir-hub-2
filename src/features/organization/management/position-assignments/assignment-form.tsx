'use client'

import { SaveIcon, UserRoundCheckIcon } from 'lucide-react'
import { useActionState, useState } from 'react'
import { type PositionId, resolvePosition } from '@/core/topology'
import type { UserDisplayOption } from '@/features/organization/core/labels'
import { UserCombobox } from '@/features/organization/management/components/user-combobox'
import {
  createPositionAssignmentAction,
  endPositionAssignmentAction,
} from '@/features/organization/management/position-assignments/actions'
import {
  CreatePositionAssignmentFormSchema,
  EndPositionAssignmentFormSchema,
} from '@/features/organization/management/position-assignments/schemas'
import type { listPositionAssignmentOptions } from '@/features/organization/management/position-assignments/service'
import { formatDateInput } from '@/shared/formatting'
import { FormMessageToast } from '@/shared/forms/error-handling'
import { useServerActionForm } from '@/shared/forms/tanstack'
import type { EntityOption } from '@/shared/types'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'

type UserOptions = UserDisplayOption[]
type PositionAssignmentToEnd = { id: string; userId: string; startsAt: Date; userLabel: string }

export function CreatePositionAssignmentForm({
  users,
  positions,
}: {
  users: UserOptions
  positions: ReturnType<typeof listPositionAssignmentOptions>
}) {
  const [state, formAction, isPending] = useActionState(createPositionAssignmentAction, {})
  const form = useServerActionForm({
    schema: CreatePositionAssignmentFormSchema,
    defaultValues: { positionId: '', userId: '' },
    state,
  })

  return (
    <form action={formAction} onSubmit={() => form.handleSubmit()} noValidate className="flex flex-col gap-4">
      <FieldGroup>
        <form.Field name="positionId">
          {(field) => {
            const isInvalid = !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="new-assignment-position">Position</FieldLabel>
                <NativeSelect
                  id="new-assignment-position"
                  name={field.name}
                  className="w-full"
                  aria-invalid={isInvalid}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(resolvePosition(event.target.value)?.id ?? '')}
                >
                  <NativeSelectOption value="">Choose Position</NativeSelectOption>
                  {positions.map((option) => (
                    <NativeSelectOption key={option.position.id} value={option.position.id}>
                      {option.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
        <form.Field name="userId">
          {(field) => {
            const isInvalid = !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="new-assignment-user">User</FieldLabel>
                <NativeSelect
                  id="new-assignment-user"
                  name={field.name}
                  className="w-full"
                  aria-invalid={isInvalid}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
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
      </FieldGroup>
      <Button type="submit" className="w-fit" disabled={isPending || form.state.isSubmitting}>
        <UserRoundCheckIcon data-icon="inline-start" />
        {isPending ? 'Assigning' : 'Assign'}
      </Button>
      <FormMessageToast state={state} />
    </form>
  )
}

export function AssignPositionHolderControl({ users, positionId }: { users: UserOptions; positionId: PositionId }) {
  const [isAssigning, setIsAssigning] = useState(false)
  if (!isAssigning) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Vacant Position</p>
        <Button onClick={() => setIsAssigning(true)} type="button" variant="outline">
          Assign Holder
        </Button>
      </div>
    )
  }
  return <AssignPositionHolderForm users={users} positionId={positionId} onCancel={() => setIsAssigning(false)} />
}

export function AssignUserPositionControl({
  userId,
  positions,
}: {
  userId: string
  positions: EntityOption<PositionId>[]
}) {
  const [isAssigning, setIsAssigning] = useState(false)
  const [state, formAction, isPending] = useActionState(createPositionAssignmentAction, {})
  const form = useServerActionForm({
    schema: CreatePositionAssignmentFormSchema,
    defaultValues: { userId, positionId: '' },
    state,
  })
  if (!isAssigning)
    return (
      <Button onClick={() => setIsAssigning(true)} type="button" variant="outline">
        Assign Position
      </Button>
    )

  return (
    <form
      action={formAction}
      onSubmit={() => form.handleSubmit()}
      noValidate
      className="space-y-4 rounded-lg border bg-muted/20 p-4"
    >
      <input name="userId" type="hidden" value={userId} />
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-medium">Assign Position</h3>
        <Button onClick={() => setIsAssigning(false)} size="sm" type="button" variant="ghost">
          Cancel
        </Button>
      </div>
      <FieldGroup className="sm:grid sm:grid-cols-2">
        <form.Field name="positionId">
          {(field) => {
            const isInvalid = !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={`user-${userId}-position`}>Position</FieldLabel>
                <NativeSelect
                  aria-invalid={isInvalid}
                  className="w-full"
                  id={`user-${userId}-position`}
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
      </FieldGroup>
      <Button disabled={isPending || form.state.isSubmitting} type="submit">
        {isPending ? 'Assigning' : 'Assign'}
      </Button>
      <FormMessageToast state={state} />
    </form>
  )
}

function AssignPositionHolderForm({
  users,
  positionId,
  onCancel,
}: {
  users: UserOptions
  positionId: PositionId
  onCancel: () => void
}) {
  const [state, formAction, isPending] = useActionState(createPositionAssignmentAction, {})
  const form = useServerActionForm({
    schema: CreatePositionAssignmentFormSchema,
    defaultValues: { positionId, userId: '' },
    state,
  })
  return (
    <form
      action={formAction}
      onSubmit={() => form.handleSubmit()}
      noValidate
      className="grid gap-3 rounded-lg border bg-muted/20 p-4 sm:grid-cols-[minmax(12rem,1fr)_auto_auto] sm:items-end"
    >
      <input name="positionId" type="hidden" value={positionId} />
      <form.Field name="userId">
        {(field) => {
          const isInvalid = !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={`assignment-user-${positionId}`}>User</FieldLabel>
              <UserCombobox
                id={`assignment-user-${positionId}`}
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
      <div className="flex gap-2">
        <Button disabled={isPending || form.state.isSubmitting} type="submit">
          {isPending ? 'Assigning' : 'Assign'}
        </Button>
        <Button onClick={onCancel} type="button" variant="ghost">
          Cancel
        </Button>
      </div>
      <FormMessageToast state={state} />
    </form>
  )
}

export function EndPositionAssignmentForm({
  assignment,
  immediate = false,
}: {
  assignment: PositionAssignmentToEnd & {
    position: { name: string }
  }
  immediate?: boolean
}) {
  const [state, formAction, isPending] = useActionState(endPositionAssignmentAction.bind(null, assignment.id), {})
  const form = useServerActionForm({
    schema: EndPositionAssignmentFormSchema,
    defaultValues: { endsAt: immediate ? formatDateInput(new Date()) : '' },
    state,
  })

  if (immediate) {
    return (
      <form
        action={formAction}
        onSubmit={() => form.handleSubmit()}
        noValidate
        className="flex flex-col items-end gap-1"
      >
        <input name="endsAt" type="hidden" value={form.state.values.endsAt} />
        <input name="userId" type="hidden" value={assignment.userId} />
        <Button type="submit" variant="outline" disabled={isPending || form.state.isSubmitting}>
          {isPending ? 'Ending' : 'End'}
        </Button>
        <FormMessageToast state={state} />
      </form>
    )
  }

  return (
    <form
      action={formAction}
      onSubmit={() => form.handleSubmit()}
      noValidate
      className="flex min-w-44 items-start justify-end gap-2"
    >
      <input name="userId" type="hidden" value={assignment.userId} />
      <form.Field name="endsAt">
        {(field) => {
          const isInvalid = !field.state.meta.isValid
          return (
            <div className="flex flex-col gap-1">
              <Input
                name={field.name}
                type="date"
                min={formatDateInput(assignment.startsAt)}
                aria-label={`End ${assignment.userLabel} assignment to ${assignment.position.name}`}
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

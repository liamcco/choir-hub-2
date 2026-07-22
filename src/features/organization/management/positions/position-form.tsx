'use client'

import { useActionState } from 'react'
import { formatGroupPath } from '@/features/organization/core/labels'
import type { PositionFormState } from '@/features/organization/management/positions/actions'
import { createPositionAction, updatePositionAction } from '@/features/organization/management/positions/actions'
import type {
  PositionManagementPosition,
  PositionManagementState,
} from '@/features/organization/management/positions/service'
import { FormMessage } from '@/shared/forms/error-handling'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

const initialState: PositionFormState = {}

export function CreatePositionForm({
  groups,
  onCreated,
  onSuccess,
}: {
  groups: PositionManagementState['groups']
  onCreated?: (positionId: string) => void
  onSuccess?: () => void
}) {
  const [state, formAction, isPending] = useActionState(createPositionAction, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FieldGroup>
        <PositionFields idPrefix="new-position" groups={groups} state={state} />
      </FieldGroup>
      <Button type="submit" className="w-fit" disabled={isPending}>
        {isPending ? 'Creating' : 'Create'}
      </Button>
      <FormMessage
        state={state}
        onSuccess={onSuccess}
        successAction={
          state.createdId && onCreated
            ? { label: 'View', onClick: () => onCreated(state.createdId as string) }
            : undefined
        }
      />
    </form>
  )
}

export function UpdatePositionForm({
  groups,
  positionView,
}: {
  groups: PositionManagementState['groups']
  positionView: PositionManagementPosition
}) {
  const [state, formAction, isPending] = useActionState(
    updatePositionAction.bind(null, positionView.position.id),
    initialState,
  )

  return (
    <form action={formAction} className="grid gap-4 lg:grid-cols-[minmax(11rem,14rem)_1fr_auto] lg:items-start">
      <PositionFields
        idPrefix={positionView.position.id}
        groups={groups}
        state={state}
        name={positionView.position.name}
        description={positionView.position.description ?? ''}
        selectedGroupIds={positionView.scopeGroups.map((group) => group.id)}
        descriptionClassName="lg:col-span-2"
        descriptionRows={2}
      />
      <div className="flex flex-col items-start gap-2 lg:row-span-3 lg:items-end">
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? 'Saving' : 'Save'}
        </Button>
        <FormMessage state={state} />
      </div>
    </form>
  )
}

function PositionFields({
  idPrefix,
  groups,
  state,
  name,
  description,
  selectedGroupIds = [],
  descriptionClassName,
  descriptionRows = 3,
}: {
  idPrefix: string
  groups: PositionManagementState['groups']
  state: PositionFormState
  name?: string
  description?: string
  selectedGroupIds?: string[]
  descriptionClassName?: string
  descriptionRows?: number
}) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-name`}>Name</FieldLabel>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          defaultValue={name}
          required
          aria-invalid={!!state.fieldErrors?.name}
        />
        <FieldError>{state.fieldErrors?.name}</FieldError>
      </Field>
      <Field className={descriptionClassName}>
        <FieldLabel htmlFor={`${idPrefix}-description`}>Description</FieldLabel>
        <Textarea
          id={`${idPrefix}-description`}
          name="description"
          defaultValue={description}
          rows={descriptionRows}
          aria-invalid={!!state.fieldErrors?.description}
        />
        <FieldError>{state.fieldErrors?.description}</FieldError>
      </Field>
      <FieldSet className="gap-3 lg:col-span-2">
        <FieldLegend variant="label">Position Scopes</FieldLegend>
        <div className="grid gap-2 sm:grid-cols-2">
          {groups.map((group) => {
            const id = `${idPrefix}-group-${group.id}`
            return (
              <Field key={group.id} orientation="horizontal" className="rounded-lg border p-3">
                <Checkbox
                  id={id}
                  name="groupIds"
                  value={group.id}
                  defaultChecked={selectedGroupIds.includes(group.id)}
                  aria-invalid={!!state.fieldErrors?.groupIds}
                />
                <FieldContent>
                  <FieldLabel htmlFor={id}>{formatGroupPath(groups, group)}</FieldLabel>
                </FieldContent>
              </Field>
            )
          })}
        </div>
        <FieldError>{state.fieldErrors?.groupIds}</FieldError>
      </FieldSet>
    </>
  )
}

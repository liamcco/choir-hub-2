'use client'

import { useActionState } from 'react'
import { defaultGroupKind, formatGroupKind, groupKindOptions } from '@/features/organization/core/group-kind'
import { formatGroupPath } from '@/features/organization/core/labels'
import type { GroupFormState } from '@/features/organization/management/groups/actions'
import { createGroupAction, updateGroupAction } from '@/features/organization/management/groups/actions'
import type { Group } from '@/prisma/generated/client'
import { FormMessage } from '@/shared/forms/error-handling'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'
import { Textarea } from '@/shared/ui/textarea'

const initialState: GroupFormState = {}

export function CreateGroupForm({ groups }: { groups: Group[] }) {
  const [state, formAction, isPending] = useActionState(createGroupAction, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FieldGroup>
        <GroupFields idPrefix="new-group" groups={groups} state={state} kind={defaultGroupKind} />
      </FieldGroup>
      <Button type="submit" className="w-fit" disabled={isPending}>
        {isPending ? 'Creating' : 'Create'}
      </Button>
      <FormMessage state={state} />
    </form>
  )
}

export function UpdateGroupForm({ group, groups }: { group: Group; groups: Group[] }) {
  const [state, formAction, isPending] = useActionState(updateGroupAction.bind(null, group.id), initialState)

  return (
    <form action={formAction} className="grid gap-4 lg:grid-cols-[minmax(11rem,14rem)_1fr_1fr_auto] lg:items-start">
      <GroupFields
        idPrefix={group.id}
        groups={groups}
        state={state}
        name={group.name}
        description={group.description ?? ''}
        kind={group.kind}
        parentGroupId={group.parentGroupId ?? ''}
        currentGroupId={group.id}
        descriptionClassName="lg:col-span-3"
        descriptionRows={2}
      />
      <div className="flex flex-col items-start gap-2 lg:row-span-2 lg:items-end">
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? 'Saving' : 'Save'}
        </Button>
        <FormMessage state={state} />
      </div>
    </form>
  )
}

function GroupFields({
  idPrefix,
  groups,
  state,
  name,
  description,
  kind,
  parentGroupId,
  currentGroupId,
  descriptionClassName,
  descriptionRows = 3,
}: {
  idPrefix: string
  groups: Group[]
  state: GroupFormState
  name?: string
  description?: string
  kind: (typeof groupKindOptions)[number]
  parentGroupId?: string
  currentGroupId?: string
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
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-kind`}>Group Kind</FieldLabel>
        <GroupKindSelect id={`${idPrefix}-kind`} name="kind" defaultValue={kind} />
        <FieldError>{state.fieldErrors?.kind}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-parentGroupId`}>Parent Group</FieldLabel>
        <ParentGroupSelect
          id={`${idPrefix}-parentGroupId`}
          name="parentGroupId"
          groups={groups}
          currentGroupId={currentGroupId}
          defaultValue={parentGroupId}
          aria-invalid={!!state.fieldErrors?.parentGroupId}
        />
        <FieldError>{state.fieldErrors?.parentGroupId}</FieldError>
      </Field>
    </>
  )
}

function GroupKindSelect(props: Omit<React.ComponentProps<typeof NativeSelect>, 'children'>) {
  return (
    <NativeSelect className="w-full" {...props}>
      {groupKindOptions.map((kind) => (
        <NativeSelectOption key={kind} value={kind}>
          {formatGroupKind(kind)}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}

function ParentGroupSelect({
  groups,
  currentGroupId,
  ...props
}: Omit<React.ComponentProps<typeof NativeSelect>, 'children'> & {
  groups: Group[]
  currentGroupId?: string
}) {
  return (
    <NativeSelect className="w-full" {...props}>
      <NativeSelectOption value="">No parent Group</NativeSelectOption>
      {groups
        .filter((group) => group.id !== currentGroupId)
        .map((group) => (
          <NativeSelectOption key={group.id} value={group.id}>
            {formatGroupPath(groups, group)}
          </NativeSelectOption>
        ))}
    </NativeSelect>
  )
}

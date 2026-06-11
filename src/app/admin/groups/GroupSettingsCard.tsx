'use client'

import { FormEvent, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Check, Trash2 } from 'lucide-react'

import { deleteGroupMutation, updateGroupMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { updateGroupSchema } from '@/api/models/groups'
import { getErrorMessage } from '@/common/errors/utils'
import type { Group, GroupKind } from '@/common/groups/types'
import { FormError, selectClassName } from '@/common/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function GroupSettingsCard({
  group,
  groupKinds,
  groups,
  onChanged,
}: {
  group: Group | null
  groupKinds: GroupKind[]
  groups: Group[]
  onChanged: () => Promise<unknown>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selected Group</CardTitle>
        <CardDescription>{group ? group.name : 'Select a group to edit'}</CardDescription>
      </CardHeader>
      <CardContent>
        {group ? (
          <GroupSettingsForm key={group.id} group={group} groupKinds={groupKinds} groups={groups} onChanged={onChanged} />
        ) : (
          <p className="text-sm text-muted-foreground">No group selected.</p>
        )}
      </CardContent>
    </Card>
  )
}

function GroupSettingsForm({
  group,
  groupKinds,
  groups,
  onChanged,
}: {
  group: Group
  groupKinds: GroupKind[]
  groups: Group[]
  onChanged: () => Promise<unknown>
}) {
  const updateMutation = useMutation(updateGroupMutation())
  const deleteMutation = useMutation(deleteGroupMutation())
  const [active, setActive] = useState(group.active)
  const [isContainer, setIsContainer] = useState(group.isContainer)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    const parentGroupId = String(formData.get('parentGroupId') ?? '')
    const parsed = updateGroupSchema.safeParse({
      kindId: String(formData.get('kindId') ?? ''),
      name: String(formData.get('name') ?? ''),
      description: String(formData.get('description') ?? ''),
      active,
      isContainer,
      parentGroupId: parentGroupId || null,
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid group')
      return
    }

    try {
      await updateMutation.mutateAsync({ path: { id: group.id }, body: parsed.data })
      await onChanged()
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="selected-group-kind">Kind</FieldLabel>
            <select
              id="selected-group-kind"
              name="kindId"
              className={selectClassName}
              defaultValue={group.kindId}
              disabled={updateMutation.isPending}
            >
              {groupKinds.map((kind) => (
                <option key={kind.id} value={kind.id}>
                  {kind.name}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="selected-group-name">Name</FieldLabel>
            <Input id="selected-group-name" name="name" defaultValue={group.name} disabled={updateMutation.isPending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="selected-group-description">Description optional</FieldLabel>
            <Input
              id="selected-group-description"
              name="description"
              defaultValue={group.description ?? ''}
              disabled={updateMutation.isPending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="selected-group-parent">Parent optional</FieldLabel>
            <select
              id="selected-group-parent"
              name="parentGroupId"
              className={selectClassName}
              defaultValue={group.parentGroupId ?? ''}
              disabled={updateMutation.isPending}
            >
              <option value="">Root group</option>
              {groups
                .filter((candidate) => candidate.id !== group.id)
                .map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
            </select>
          </Field>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={active}
                disabled={updateMutation.isPending}
                onCheckedChange={(checked) => setActive(checked === true)}
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isContainer}
                disabled={updateMutation.isPending}
                onCheckedChange={(checked) => setIsContainer(checked === true)}
              />
              Container
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={updateMutation.isPending}>
              <Check />
              Save
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={async () => {
                try {
                  setError(null)
                  await deleteMutation.mutateAsync({ path: { id: group.id } })
                  await onChanged()
                } catch (submitError) {
                  setError(getErrorMessage(submitError))
                }
              }}
            >
              <Trash2 />
              Delete
            </Button>
          </div>
        </FieldGroup>
      </form>
      <FormError error={error ?? getErrorMessage(updateMutation.error) ?? getErrorMessage(deleteMutation.error)} />
    </>
  )
}

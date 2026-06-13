'use client'

import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Check, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { deleteGroupMutation, updateGroupMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { updateGroupSchema } from '@/api/models/group'
import { getErrorMessage } from '@/common/errors/utils'
import type { Group, GroupKind } from '@/common/groups/types'
import { FormError } from '@/common/ui/form'
import { ControlledFieldSelect } from '@/components/forms/controlled-field-select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import z from 'zod'

const groupSettingsFormSchema = z.object({
  kindId: z.string().min(1, 'Group kind is required'),
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string(),
  active: z.boolean(),
  isContainer: z.boolean(),
  parentGroupId: z.string().min(1).nullable(),
})

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
          <GroupSettingsForm
            key={group.id}
            group={group}
            groupKinds={groupKinds}
            groups={groups}
            onChanged={onChanged}
          />
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
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      kindId: group.kindId,
      name: group.name,
      description: group.description ?? '',
      active: group.active,
      isContainer: group.isContainer,
      parentGroupId: group.parentGroupId,
    } satisfies z.input<typeof updateGroupSchema>,
    validators: {
      onSubmit: groupSettingsFormSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null)

      try {
        await updateMutation.mutateAsync({
          path: { id: group.id },
          body: {
            kindId: value.kindId,
            name: value.name?.trim(),
            description: value.description?.trim() || null,
            active: value.active,
            isContainer: value.isContainer,
            parentGroupId: value.parentGroupId || null,
          },
        })
        await onChanged()
      } catch (submitError) {
        setError(getErrorMessage(submitError))
      }
    },
  })

  const isSaving = updateMutation.isPending || form.state.isSubmitting

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <form.Field name="kindId">
            {(field) => (
              <ControlledFieldSelect
                id={field.name}
                label="Kind"
                items={groupKinds}
                getValue={(kind) => kind.id}
                getLabel={(kind) => kind.name}
                placeholder="Select kind"
                value={field.state.value}
                disabled={isSaving}
                onBlur={field.handleBlur}
                onValueChange={(value) => field.handleChange(value)}
                errors={field.state.meta.isTouched ? field.state.meta.errors : []}
              />
            )}
          </form.Field>
          <form.Field name="name">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  disabled={isSaving}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldError errors={field.state.meta.isTouched ? field.state.meta.errors : []} />
              </Field>
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Description optional</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value ?? ''}
                  disabled={isSaving}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldError errors={field.state.meta.isTouched ? field.state.meta.errors : []} />
              </Field>
            )}
          </form.Field>
          <form.Field name="parentGroupId">
            {(field) => (
              <ControlledFieldSelect
                id={field.name}
                label="Parent optional"
                items={groups.filter((candidate) => candidate.id !== group.id)}
                getValue={(candidate) => candidate.id}
                getLabel={(candidate) => candidate.name}
                placeholder="Root group"
                emptyItem={{ value: '', label: 'Root group' }}
                value={field.state.value ?? ''}
                disabled={isSaving}
                onBlur={field.handleBlur}
                onValueChange={(value) => field.handleChange(value || null)}
                errors={field.state.meta.isTouched ? field.state.meta.errors : []}
              />
            )}
          </form.Field>
          <div className="flex items-center gap-6">
            <form.Field name="active">
              {(field) => (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.state.value}
                    disabled={isSaving}
                    onCheckedChange={(checked) => field.handleChange(checked === true)}
                  />
                  Active
                </label>
              )}
            </form.Field>
            <form.Field name="isContainer">
              {(field) => (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.state.value}
                    disabled={isSaving}
                    onCheckedChange={(checked) => field.handleChange(checked === true)}
                  />
                  Container
                </label>
              )}
            </form.Field>
          </div>
          <div className="flex flex-wrap gap-2">
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || isSaving}>
                  <Check />
                  Save
                </Button>
              )}
            </form.Subscribe>
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

'use client'

import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import z from 'zod'

import { createPositionFormSchema } from '@/api/models/group'

import { createGroupPositionMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { getErrorMessage } from '@/common/errors/utils'
import type { Group, User } from '@/common/groups/types'
import { userLabel } from '@/common/groups/utils'
import { FormError } from '@/common/ui/form'

import { ControlledFieldSelect } from '@/components/forms/controlled-field-select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const defaultPositionFormValues: z.input<typeof createPositionFormSchema> = {
  name: '',
  description: '',
  groupIds: [],
  currentHolderUserId: undefined,
}

export function CreatePositionCard({
  group,
  groups,
  users,
  onChanged,
}: {
  group: Group | null
  groups: Group[]
  users: User[]
  onChanged: () => Promise<unknown>
}) {
  const mutation = useMutation(createGroupPositionMutation())

  const form = useForm({
    defaultValues: defaultPositionFormValues,
    validators: {
      onSubmit: createPositionFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!group) {
        return
      }

      try {
        await mutation.mutateAsync({
          path: { groupId: group.id },
          body: {
            name: value.name.trim(),
            description: value.description?.trim() || undefined,
            groupIds: value.groupIds?.filter((groupId) => groupId !== group.id),
            currentHolderUserId: value.currentHolderUserId,
          },
        })
        form.reset()
        await onChanged()
      } catch {
        // The mutation stores the error for rendering below.
      }
    },
  })

  const isSaving = mutation.isPending || form.state.isSubmitting

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Position</CardTitle>
        <CardDescription>{group ? group.name : 'Select a group first'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field name="name">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    disabled={!group || isSaving}
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
                    disabled={!group || isSaving}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  <FieldError errors={field.state.meta.isTouched ? field.state.meta.errors : []} />
                </Field>
              )}
            </form.Field>
            <form.Field name="groupIds">
              {(field) => (
                <Field>
                  <FieldLabel>Additional groups optional</FieldLabel>
                  <div className="grid gap-2">
                    {groups
                      .filter((candidate) => candidate.id !== group?.id)
                      .map((candidate) => (
                        <label key={candidate.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={field.state.value?.includes(candidate.id) ?? false}
                            disabled={!group || isSaving}
                            onCheckedChange={(checked) => {
                              const selectedGroupIds = field.state.value ?? []

                              field.handleChange(
                                checked === true
                                  ? [...selectedGroupIds, candidate.id]
                                  : selectedGroupIds.filter((groupId) => groupId !== candidate.id),
                              )
                            }}
                          />
                          {candidate.name}
                        </label>
                      ))}
                  </div>
                  <FieldError errors={field.state.meta.isTouched ? field.state.meta.errors : []} />
                </Field>
              )}
            </form.Field>
            <form.Field name="currentHolderUserId">
              {(field) => (
                <ControlledFieldSelect
                  id={field.name}
                  label="Holder optional"
                  items={users}
                  getValue={(user) => user.id}
                  getLabel={userLabel}
                  placeholder="Vacant"
                  emptyItem={{ value: '', label: 'Vacant' }}
                  value={field.state.value ?? ''}
                  disabled={!group || isSaving}
                  onBlur={field.handleBlur}
                  onValueChange={(value) => field.handleChange(value || undefined)}
                  errors={field.state.meta.isTouched ? field.state.meta.errors : []}
                />
              )}
            </form.Field>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!group || !canSubmit || isSubmitting || isSaving}>
                  <Plus />
                  Create
                </Button>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>
        <FormError error={getErrorMessage(mutation.error)} />
      </CardContent>
    </Card>
  )
}

'use client'

import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'

import { createGroupMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { createGroupSchema } from '@/api/models/groups'
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

const defaultGroupFormValues: z.input<typeof createGroupSchema> = {
  kindId: '',
  name: '',
  description: '',
  active: true,
  isContainer: false,
  parentGroupId: null,
}

export function CreateGroupCard({
  groupKinds,
  groups,
  onChanged,
}: {
  groupKinds: GroupKind[]
  groups: Group[]
  onChanged: (createdGroupId: string) => Promise<unknown>
}) {
  const mutation = useMutation(createGroupMutation())
  const form = useForm({
    defaultValues: defaultGroupFormValues,
    validators: {
      onSubmit: createGroupSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const createdGroup = await mutation.mutateAsync({
          body: {
            kindId: value.kindId,
            name: value.name.trim(),
            description: value.description?.trim() || undefined,
            active: value.active,
            isContainer: value.isContainer,
            parentGroupId: value.parentGroupId || null,
          },
        })
        form.reset()
        await onChanged(createdGroup.id)
      } catch {
        // The mutation stores the error for rendering below.
      }
    },
  })

  const isSaving = mutation.isPending || form.state.isSubmitting

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Group</CardTitle>
        <CardDescription>Add a group to the choir hierarchy.</CardDescription>
      </CardHeader>
      <CardContent>
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
                  items={groups}
                  getValue={(group) => group.id}
                  getLabel={(group) => group.name}
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
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || isSaving || groupKinds.length === 0}>
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

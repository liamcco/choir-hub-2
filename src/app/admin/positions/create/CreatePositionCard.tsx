'use client'

import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import z from 'zod'

import { createPositionFormSchema } from '@/api/models/position'

import { createPositionMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { getErrorMessage } from '@/common/errors/utils'
import type { Group, User } from '@/common/groups/types'
import { groupSectionsByKind, userLabel } from '@/common/groups/utils'
import { FormError } from '@/common/ui/form'

import { ControlledFieldSelect } from '@/components/forms/controlled-field-select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const defaultPositionFormValues: z.input<typeof createPositionFormSchema> = {
  name: '',
  description: '',
  groupId: '',
  currentHolderUserId: null,
}

export function CreatePositionCard({
  groups,
  users,
  onCreated,
}: {
  groups: Group[]
  users: User[]
  onCreated: () => Promise<unknown>
}) {
  const router = useRouter()
  const mutation = useMutation(createPositionMutation())
  const groupSections = groupSectionsByKind(groups)

  const form = useForm({
    defaultValues: defaultPositionFormValues,
    validators: {
      onSubmit: createPositionFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync({
          body: {
            name: value.name.trim(),
            description: value.description?.trim(),
            groupIds: [value.groupId],
            currentHolderUserId: value.currentHolderUserId ?? undefined,
          },
        })
        form.reset()
        await onCreated()
        router.push('/admin/positions')
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
        <CardDescription>Add the position to a group and optionally assign an initial holder.</CardDescription>
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
            <form.Field name="groupId">
              {(field) => (
                <ControlledFieldSelect
                  id={field.name}
                  label="Group"
                  sections={groupSections}
                  getValue={(group) => group.id}
                  getLabel={(group) => group.name}
                  placeholder="Select group"
                  value={field.state.value}
                  disabled={isSaving}
                  onBlur={field.handleBlur}
                  onValueChange={field.handleChange}
                  errors={field.state.meta.isTouched ? field.state.meta.errors : []}
                />
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
                  disabled={isSaving}
                  onBlur={field.handleBlur}
                  onValueChange={(value) => field.handleChange(value || undefined)}
                  errors={field.state.meta.isTouched ? field.state.meta.errors : []}
                />
              )}
            </form.Field>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || isSaving}>
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

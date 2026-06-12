'use client'

import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import z from 'zod'

import { createPositionSchema } from '@/api/models/groups'

import { createGroupPositionMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { getErrorMessage } from '@/common/errors/utils'
import type { Group, Membership, Person } from '@/common/groups/types'
import { personLabel } from '@/common/groups/utils'
import { FormError } from '@/common/ui/form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const defaultPositionFormValues: z.input<typeof createPositionSchema> = {
  name: '',
  description: '',
  personGroupMembershipId: null,
}

export function CreatePositionCard({
  group,
  memberships,
  people,
  onChanged,
}: {
  group: Group | null
  memberships: Membership[]
  people: Person[]
  onChanged: () => Promise<unknown>
}) {
  const mutation = useMutation(createGroupPositionMutation())
  const peopleById = new Map(people.map((person) => [person.id, person]))

  const form = useForm({
    defaultValues: defaultPositionFormValues,
    validators: {
      onSubmit: createPositionSchema,
    },
    onSubmit: async ({ value }) => {
      if (!group) {
        return
      }

      try {
        await mutation.mutateAsync({
          path: { id: group.id },
          body: {
            name: value.name.trim(),
            description: value.description?.trim() || undefined,
            personGroupMembershipId: value.personGroupMembershipId || null,
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
            <form.Field name="personGroupMembershipId">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Holder optional</FieldLabel>
                  <Select
                    value={field.state.value ?? ''}
                    disabled={!group || isSaving}
                    onValueChange={(value) => field.handleChange(value || null)}
                  >
                    <SelectTrigger id={field.name} onBlur={field.handleBlur} className="w-full">
                      <SelectValue placeholder="Vacant">
                        {(value) =>
                          value
                            ? personLabel(peopleById.get(memberships.find((membership) => membership.id === value)?.personId ?? ''))
                            : 'Vacant'
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Vacant</SelectItem>
                      {memberships.map((membership) => (
                        <SelectItem key={membership.id} value={membership.id}>
                          {personLabel(peopleById.get(membership.personId))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.isTouched ? field.state.meta.errors : []} />
                </Field>
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

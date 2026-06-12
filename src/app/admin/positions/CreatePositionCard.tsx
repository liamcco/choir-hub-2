'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'

import { createGroupPositionMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { createPositionSchema } from '@/api/models/groups'
import { getErrorMessage } from '@/common/errors/utils'
import type { Group, Membership, Person } from '@/common/groups/types'
import { personLabel } from '@/common/groups/utils'
import { FormError, selectClassName } from '@/common/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

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
  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people])
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!group) {
      return
    }

    setError(null)
    const form = event.currentTarget
    const formData = new FormData(form)
    const membershipId = String(formData.get('personGroupMembershipId') ?? '')
    const parsed = createPositionSchema.safeParse({
      name: String(formData.get('name') ?? ''),
      description: String(formData.get('description') ?? ''),
      personGroupMembershipId: membershipId || null,
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid position')
      return
    }

    try {
      const body = {
        name: parsed.data.name,
        description: parsed.data.description,
        personGroupMembershipId: parsed.data.personGroupMembershipId,
      }
      await mutation.mutateAsync({ path: { id: group.id }, body })
      form.reset()
      await onChanged()
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Position</CardTitle>
        <CardDescription>{group ? group.name : 'Select a group first'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="position-name">Name</FieldLabel>
              <Input id="position-name" name="name" disabled={!group || mutation.isPending} />
            </Field>
            <Field>
              <FieldLabel htmlFor="position-description">Description optional</FieldLabel>
              <Input id="position-description" name="description" disabled={!group || mutation.isPending} />
            </Field>
            <Field>
              <FieldLabel htmlFor="position-holder">Holder optional</FieldLabel>
              <select
                id="position-holder"
                name="personGroupMembershipId"
                className={selectClassName}
                disabled={!group || mutation.isPending}
              >
                <option value="">Vacant</option>
                {memberships.map((membership) => (
                  <option key={membership.id} value={membership.id}>
                    {personLabel(peopleById.get(membership.personId))}
                  </option>
                ))}
              </select>
            </Field>
            <Button type="submit" disabled={!group || mutation.isPending}>
              <Plus />
              Create
            </Button>
          </FieldGroup>
        </form>
        <FormError error={error ?? getErrorMessage(mutation.error)} />
      </CardContent>
    </Card>
  )
}

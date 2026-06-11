'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Trash2, UserPlus } from 'lucide-react'

import {
  createGroupMembershipMutation,
  deleteGroupMembershipMutation,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { createMembershipSchema } from '@/api/models/groups'
import { getErrorMessage } from '@/common/errors/utils'
import type { Group, Membership, Person } from '@/common/groups/types'
import { formatDate, personLabel } from '@/common/groups/utils'
import { AsyncState } from '@/common/ui/async-state'
import { FormError, selectClassName } from '@/common/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'

export function MembershipsAdmin({
  group,
  people,
  memberships,
  effectiveCount,
  isPending,
  error,
  onMembershipsChanged,
}: {
  group: Group | null
  people: Person[]
  memberships: Membership[]
  effectiveCount: number
  isPending: boolean
  error: unknown
  onMembershipsChanged: () => Promise<unknown>
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <AddMembershipCard group={group} people={people} memberships={memberships} onChanged={onMembershipsChanged} />
      <MembershipsTable
        group={group}
        memberships={memberships}
        people={people}
        effectiveCount={effectiveCount}
        isPending={isPending}
        error={error}
        onChanged={onMembershipsChanged}
      />
    </div>
  )
}

function AddMembershipCard({
  group,
  people,
  memberships,
  onChanged,
}: {
  group: Group | null
  people: Person[]
  memberships: Membership[]
  onChanged: () => Promise<unknown>
}) {
  const mutation = useMutation(createGroupMembershipMutation())
  const [error, setError] = useState<string | null>(null)
  const memberPersonIds = new Set(memberships.map((membership) => membership.personId))
  const availablePeople = people.filter((person) => !memberPersonIds.has(person.id))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!group) {
      return
    }

    setError(null)
    const form = event.currentTarget
    const formData = new FormData(form)
    const parsed = createMembershipSchema.safeParse({
      personId: String(formData.get('personId') ?? ''),
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid membership')
      return
    }

    try {
      await mutation.mutateAsync({ path: { id: group.id }, body: parsed.data })
      form.reset()
      await onChanged()
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Member</CardTitle>
        <CardDescription>{group?.isContainer ? 'Container groups reject direct memberships.' : group?.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="membership-person">Person</FieldLabel>
              <select
                id="membership-person"
                name="personId"
                className={selectClassName}
                disabled={!group || group.isContainer || mutation.isPending}
              >
                <option value="">Select person</option>
                {availablePeople.map((person) => (
                  <option key={person.id} value={person.id}>
                    {personLabel(person)}
                  </option>
                ))}
              </select>
            </Field>
            <Button type="submit" disabled={!group || group.isContainer || mutation.isPending || availablePeople.length === 0}>
              <UserPlus />
              Add
            </Button>
          </FieldGroup>
        </form>
        <FormError error={error ?? getErrorMessage(mutation.error)} />
      </CardContent>
    </Card>
  )
}

function MembershipsTable({
  group,
  memberships,
  people,
  effectiveCount,
  isPending,
  error,
  onChanged,
}: {
  group: Group | null
  memberships: Membership[]
  people: Person[]
  effectiveCount: number
  isPending: boolean
  error: unknown
  onChanged: () => Promise<unknown>
}) {
  const deleteMutation = useMutation(deleteGroupMembershipMutation())
  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Memberships</CardTitle>
        <CardDescription>
          {memberships.length} direct / {effectiveCount} effective
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AsyncState isPending={isPending} error={error}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-130 text-left text-sm">
              <thead className="border-b text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 pr-4 font-medium">Person</th>
                  <th className="py-2 pr-4 font-medium">Added</th>
                  <th className="py-2 pr-0 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {memberships.map((membership) => (
                  <tr key={membership.id}>
                    <td className="py-3 pr-4 font-medium">{personLabel(peopleById.get(membership.personId))}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDate(membership.addedAt)}</td>
                    <td className="py-3 pr-0 text-right">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="destructive"
                        title="Remove membership"
                        aria-label="Remove membership"
                        disabled={!group || deleteMutation.isPending}
                        onClick={async () => {
                          if (!group) {
                            return
                          }

                          await deleteMutation.mutateAsync({ path: { id: group.id, membershipId: membership.id } })
                          await onChanged()
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!memberships.length ? <p className="text-sm text-muted-foreground">No direct memberships.</p> : null}
          <FormError error={getErrorMessage(deleteMutation.error)} />
        </AsyncState>
      </CardContent>
    </Card>
  )
}

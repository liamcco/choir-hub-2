'use client'

import { useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Trash2, X } from 'lucide-react'

import {
  deletePositionMutation,
  updatePositionMutation,
  vacatePositionMutation,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { updatePositionSchema } from '@/api/models/groups'
import { getErrorMessage } from '@/common/errors/utils'
import type { Group, Membership, Person, Position } from '@/common/groups/types'
import { formatDate, personLabel } from '@/common/groups/utils'
import { AsyncState } from '@/common/ui/async-state'
import { FormError, selectClassName } from '@/common/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function PositionsTable({
  group,
  positions,
  memberships,
  people,
  isPending,
  error,
  onChanged,
}: {
  group: Group | null
  positions: Position[]
  memberships: Membership[]
  people: Person[]
  isPending: boolean
  error: unknown
  onChanged: () => Promise<unknown>
}) {
  const updateMutation = useMutation(updatePositionMutation())
  const vacateMutation = useMutation(vacatePositionMutation())
  const deleteMutation = useMutation(deletePositionMutation())
  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people])
  const membershipsById = useMemo(() => new Map(memberships.map((membership) => [membership.id, membership])), [memberships])

  async function assignHolder(position: Position, personGroupMembershipId: string) {
    const parsed = updatePositionSchema.safeParse({
      personGroupMembershipId: personGroupMembershipId || null,
    })

    if (!parsed.success) {
      return
    }

    const body = {
      name: parsed.data.name,
      description: parsed.data.description,
      personGroupMembershipId: parsed.data.personGroupMembershipId,
    }
    await updateMutation.mutateAsync({ path: { id: position.id }, body })
    await onChanged()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Positions</CardTitle>
        <CardDescription>{positions.length} defined</CardDescription>
      </CardHeader>
      <CardContent>
        <AsyncState isPending={isPending} error={error}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-170 text-left text-sm">
              <thead className="border-b text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 pr-4 font-medium">Position</th>
                  <th className="py-2 pr-4 font-medium">Holder</th>
                  <th className="py-2 pr-4 font-medium">Held Since</th>
                  <th className="py-2 pr-0 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {positions.map((position) => {
                  const holderMembership = position.personGroupMembershipId
                    ? membershipsById.get(position.personGroupMembershipId)
                    : null

                  return (
                    <tr key={position.id}>
                      <td className="py-3 pr-4 font-medium">{position.name}</td>
                      <td className="py-3 pr-4">
                        <select
                          className={selectClassName}
                          value={position.personGroupMembershipId ?? ''}
                          disabled={!group || updateMutation.isPending}
                          onChange={(event) => {
                            void assignHolder(position, event.target.value)
                          }}
                        >
                          <option value="">Vacant</option>
                          {memberships.map((membership) => (
                            <option key={membership.id} value={membership.id}>
                              {personLabel(peopleById.get(membership.personId))}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {holderMembership ? formatDate(position.heldSince) : '-'}
                      </td>
                      <td className="py-3 pr-0">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="outline"
                            title="Vacate position"
                            aria-label="Vacate position"
                            disabled={!position.personGroupMembershipId || vacateMutation.isPending}
                            onClick={async () => {
                              await vacateMutation.mutateAsync({ path: { id: position.id } })
                              await onChanged()
                            }}
                          >
                            <X />
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="destructive"
                            title="Delete position"
                            aria-label="Delete position"
                            disabled={deleteMutation.isPending}
                            onClick={async () => {
                              await deleteMutation.mutateAsync({ path: { id: position.id } })
                              await onChanged()
                            }}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {!positions.length ? <p className="text-sm text-muted-foreground">No positions defined.</p> : null}
          <FormError
            error={
              getErrorMessage(updateMutation.error) ??
              getErrorMessage(vacateMutation.error) ??
              getErrorMessage(deleteMutation.error)
            }
          />
        </AsyncState>
      </CardContent>
    </Card>
  )
}

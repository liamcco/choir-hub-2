'use client'

import { useMutation } from '@tanstack/react-query'
import { Trash2, X } from 'lucide-react'

import { updatePositionSchema } from '@/api/models/groups'

import {
  deletePositionMutation,
  updatePositionMutation,
  vacatePositionMutation,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { getErrorMessage } from '@/common/errors/utils'
import type { Group, Membership, Person, Position } from '@/common/groups/types'
import { formatDate, personLabel } from '@/common/groups/utils'
import { FormError } from '@/common/ui/form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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

  const peopleById = new Map(people.map((person) => [person.id, person]))

  const membershipsById = new Map(memberships.map((membership) => [membership.id, membership]))

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
        {isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : getErrorMessage(error) ? (
          <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
        ) : (
          <>
            <Table className="min-w-170">
              <TableHeader className="text-xs text-muted-foreground uppercase">
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Holder</TableHead>
                  <TableHead>Held Since</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => {
                  const holderMembership = position.personGroupMembershipId
                    ? membershipsById.get(position.personGroupMembershipId)
                    : null

                  return (
                    <TableRow key={position.id}>
                      <TableCell className="font-medium">{position.name}</TableCell>
                      <TableCell>
                        <Select
                          value={position.personGroupMembershipId ?? ''}
                          disabled={!group || updateMutation.isPending}
                          onValueChange={(value) => {
                            void assignHolder(position, value ?? '')
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Vacant">
                              {(value) =>
                                value
                                  ? personLabel(
                                      peopleById.get(
                                        memberships.find((membership) => membership.id === value)?.personId ?? '',
                                      ),
                                    )
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
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {holderMembership ? formatDate(position.heldSince) : '-'}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {!positions.length ? <p className="text-sm text-muted-foreground">No positions defined.</p> : null}
            <FormError
              error={
                getErrorMessage(updateMutation.error) ??
                getErrorMessage(vacateMutation.error) ??
                getErrorMessage(deleteMutation.error)
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import { useMutation } from '@tanstack/react-query'
import { Trash2, X } from 'lucide-react'

import { updatePositionSchema } from '@/api/models/group'

import {
  deletePositionMutation,
  updatePositionMutation,
  vacatePositionMutation,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { getErrorMessage } from '@/common/errors/utils'
import type { Group, Person, Position } from '@/common/groups/types'
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
  people,
  isPending,
  error,
  onChanged,
}: {
  group: Group | null
  positions: Position[]
  people: Person[]
  isPending: boolean
  error: unknown
  onChanged: () => Promise<unknown>
}) {
  const updateMutation = useMutation(updatePositionMutation())
  const vacateMutation = useMutation(vacatePositionMutation())
  const deleteMutation = useMutation(deletePositionMutation())

  const peopleById = new Map(people.map((person) => [person.id, person]))

  async function assignHolder(position: Position, currentHolderPersonId: string) {
    const parsed = updatePositionSchema.safeParse({
      currentHolderPersonId: currentHolderPersonId || null,
    })

    if (!parsed.success) {
      return
    }

    const body = {
      name: parsed.data.name,
      description: parsed.data.description,
      currentHolderPersonId: parsed.data.currentHolderPersonId,
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
                  <TableHead>Groups</TableHead>
                  <TableHead>Holder</TableHead>
                  <TableHead>Held Since</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {(position.groups ?? [])
                        .map((positionGroup) => positionGroup.group?.name ?? positionGroup.groupId)
                        .join(', ')}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={position.currentHolderPersonId ?? ''}
                        disabled={!group || updateMutation.isPending}
                        onValueChange={(value) => {
                          void assignHolder(position, value ?? '')
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Vacant">
                            {(value) => (value ? personLabel(peopleById.get(String(value))) : 'Vacant')}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Vacant</SelectItem>
                          {people.map((person) => (
                            <SelectItem key={person.id} value={person.id}>
                              {personLabel(person)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {position.currentHolderPersonId ? formatDate(position.heldSince) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          title="Vacate position"
                          aria-label="Vacate position"
                          disabled={!position.currentHolderPersonId || vacateMutation.isPending}
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
                ))}
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

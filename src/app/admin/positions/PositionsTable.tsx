'use client'

import { useMutation } from '@tanstack/react-query'
import { Trash2, X } from 'lucide-react'

import { updatePositionFormSchema } from '@/api/models/position'

import {
  deletePositionMutation,
  updatePositionMutation,
  vacatePositionMutation,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { DataState, EmptyText } from '@/app/admin/_components/data-state'
import type { Group, Position, User } from '@/common/groups/types'
import { formatDate, userLabel } from '@/common/groups/utils'
import { FormError } from '@/common/ui/form'

import { getErrorMessage } from '@/common/errors/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function PositionsTable({
  group,
  positions,
  users,
  isPending,
  error,
  onChanged,
}: {
  group: Group | null
  positions: Position[]
  users: User[]
  isPending: boolean
  error: unknown
  onChanged: () => Promise<unknown>
}) {
  const updateMutation = useMutation(updatePositionMutation())
  const vacateMutation = useMutation(vacatePositionMutation())
  const deleteMutation = useMutation(deletePositionMutation())

  const usersById = new Map(users.map((user) => [user.id, user]))

  async function assignHolder(position: Position, currentHolderUserId: string) {
    const parsed = updatePositionFormSchema.safeParse({
      currentHolderUserId: currentHolderUserId || null,
    })

    if (!parsed.success) {
      return
    }

    const body = {
      name: parsed.data.name,
      description: parsed.data.description,
      currentHolderUserId: parsed.data.currentHolderUserId,
    }
    await updateMutation.mutateAsync({ path: { positionId: position.id }, body })
    await onChanged()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Positions</CardTitle>
        <CardDescription>{positions.length} defined</CardDescription>
      </CardHeader>
      <CardContent>
        <DataState isPending={isPending} error={error}>
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
                {positions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.name}</TableCell>
                    <TableCell>
                      <Select
                        value={position.currentHolder?.id ?? ''}
                        disabled={!group || updateMutation.isPending}
                        onValueChange={(value) => {
                          void assignHolder(position, value ?? '')
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Vacant">
                            {(value) => (value ? userLabel(usersById.get(String(value))) : 'Vacant')}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Vacant</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {userLabel(user)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {position.currentHolder?.id ? formatDate(position.heldSince) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          title="Vacate position"
                          aria-label="Vacate position"
                          disabled={!position.currentHolder?.id || vacateMutation.isPending}
                          onClick={async () => {
                            await vacateMutation.mutateAsync({ path: { positionId: position.id } })
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
                            await deleteMutation.mutateAsync({ path: { positionId: position.id } })
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
            {!positions.length ? <EmptyText>No positions defined.</EmptyText> : null}
            <FormError
              error={
                getErrorMessage(updateMutation.error) ??
                getErrorMessage(vacateMutation.error) ??
                getErrorMessage(deleteMutation.error)
              }
            />
          </>
        </DataState>
      </CardContent>
    </Card>
  )
}

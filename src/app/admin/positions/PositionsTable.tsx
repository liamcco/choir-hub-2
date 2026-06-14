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
  groups,
  positions,
  users,
  isPending,
  error,
  onChanged,
}: {
  groups: Group[]
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
  const positionSections = groupPositionsByGroup(groups, positions)
  const groupCount = positionSections.filter((section) => section.key !== unassignedGroupKey).length

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
        <CardDescription>
          {formatCount(positions.length, 'position')} defined across {formatCount(groupCount, 'group')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataState isPending={isPending} error={error}>
          <>
            {positionSections.length ? (
              <div className="space-y-6">
                {positionSections.map((section) => (
                  <section key={section.key} className="space-y-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="text-sm font-medium">{section.name}</h2>
                      <span className="text-xs text-muted-foreground">{formatCount(section.positions.length, 'position')}</span>
                    </div>
                    <PositionsSectionTable
                      positions={section.positions}
                      users={users}
                      usersById={usersById}
                      isUpdating={updateMutation.isPending}
                      isVacating={vacateMutation.isPending}
                      isDeleting={deleteMutation.isPending}
                      onAssignHolder={assignHolder}
                      onVacate={async (position) => {
                        await vacateMutation.mutateAsync({ path: { positionId: position.id } })
                        await onChanged()
                      }}
                      onDelete={async (position) => {
                        await deleteMutation.mutateAsync({ path: { positionId: position.id } })
                        await onChanged()
                      }}
                    />
                  </section>
                ))}
              </div>
            ) : (
              <EmptyText>No positions defined.</EmptyText>
            )}
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

function PositionsSectionTable({
  positions,
  users,
  usersById,
  isUpdating,
  isVacating,
  isDeleting,
  onAssignHolder,
  onVacate,
  onDelete,
}: {
  positions: Position[]
  users: User[]
  usersById: Map<string, User>
  isUpdating: boolean
  isVacating: boolean
  isDeleting: boolean
  onAssignHolder: (position: Position, currentHolderUserId: string) => Promise<void>
  onVacate: (position: Position) => Promise<void>
  onDelete: (position: Position) => Promise<void>
}) {
  return (
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
                disabled={isUpdating}
                onValueChange={(value) => {
                  void onAssignHolder(position, value ?? '')
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
                  disabled={!position.currentHolder?.id || isVacating}
                  onClick={() => {
                    void onVacate(position)
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
                  disabled={isDeleting}
                  onClick={() => {
                    void onDelete(position)
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
  )
}

function formatCount(count: number, label: string) {
  return `${count} ${count === 1 ? label : `${label}s`}`
}

type PositionSection = {
  key: string
  name: string
  positions: Position[]
}

const unassignedGroupKey = '__unassigned__'

function groupPositionsByGroup(groups: Group[], positions: Position[]): PositionSection[] {
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const positionsByGroupId = new Map<string, Position[]>()

  for (const position of positions) {
    const groupIds = position.groupIds.length ? position.groupIds : [unassignedGroupKey]

    for (const groupId of groupIds) {
      const groupPositions = positionsByGroupId.get(groupId) ?? []
      groupPositions.push(position)
      positionsByGroupId.set(groupId, groupPositions)
    }
  }

  const sections: PositionSection[] = groups.flatMap((group) => {
    const groupPositions = positionsByGroupId.get(group.id) ?? []

    return groupPositions.length ? [{ key: group.id, name: group.name, positions: groupPositions }] : []
  })

  for (const [groupId, groupPositions] of positionsByGroupId) {
    if (groupId === unassignedGroupKey || groupsById.has(groupId)) {
      continue
    }

    sections.push({
      key: groupId,
      name: 'Unknown group',
      positions: groupPositions,
    })
  }

  const unassignedPositions = positionsByGroupId.get(unassignedGroupKey)

  if (unassignedPositions?.length) {
    sections.push({
      key: unassignedGroupKey,
      name: 'No group',
      positions: unassignedPositions,
    })
  }

  return sections
}

'use client'

import { useMutation } from '@tanstack/react-query'
import { Pencil, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { updatePositionFormSchema } from '@/api/models/position'

import {
  deletePositionMutation,
  updatePositionMutation,
  vacatePositionMutation,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { DataState, EmptyText } from '@/app/admin/_components/data-state'
import type { Group, GroupKind, Position, User } from '@/common/groups/types'
import { formatDate, groupPositionsByGroupId } from '@/common/groups/utils'
import { FormError } from '@/common/ui/form'

import { getErrorMessage } from '@/common/errors/utils'
import { MemberCombobox } from '@/components/forms/member-combobox'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function PositionsTable({
  groups,
  groupKinds,
  positions,
  users,
  isPending,
  error,
  onChanged,
}: {
  groups: Group[]
  groupKinds: GroupKind[]
  positions: Position[]
  users: User[]
  isPending: boolean
  error: unknown
  onChanged: () => Promise<unknown>
}) {
  const updateMutation = useMutation(updatePositionMutation())
  const vacateMutation = useMutation(vacatePositionMutation())
  const deleteMutation = useMutation(deletePositionMutation())

  const [selectedKindId, setSelectedKindId] = useState('')
  const sortedGroupKinds = useMemo(
    () => [...groupKinds].sort((left, right) => left.name.localeCompare(right.name)),
    [groupKinds],
  )
  const selectedKindIdExists = sortedGroupKinds.some((kind) => kind.id === selectedKindId)
  const effectiveKindId = selectedKindIdExists ? selectedKindId : (sortedGroupKinds[0]?.id ?? '')
  const selectedKind = sortedGroupKinds.find((kind) => kind.id === effectiveKindId) ?? null
  const positionSections = groupPositionsByGroup(groups, positions, effectiveKindId)
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
      <CardHeader className="grid-cols-[1fr_auto]">
        <div>
          <CardTitle>Positions</CardTitle>
          <CardDescription>
            {selectedKind
              ? `${selectedKind.name}: ${formatCount(countSectionPositions(positionSections), 'position')} across ${formatCount(groupCount, 'group')}`
              : 'No group kinds configured'}
          </CardDescription>
        </div>
        <Select
          value={effectiveKindId}
          disabled={!sortedGroupKinds.length}
          onValueChange={(nextValue) => setSelectedKindId(nextValue ?? '')}
        >
          <SelectTrigger aria-label="Select group kind" className="w-52">
            <SelectValue placeholder="Select Group Kind">
              {(selectedValue) => sortedGroupKinds.find((kind) => kind.id === selectedValue)?.name ?? 'Select Group Kind'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            {sortedGroupKinds.map((kind) => (
              <SelectItem key={kind.id} value={kind.id}>
                {kind.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <DataState isPending={isPending} error={error}>
          <>
            {positionSections.length ? (
              <PositionsGroupedTable
                sections={positionSections}
                users={users}
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
            ) : (
              <EmptyText>
                {selectedKind ? `No positions associated with ${selectedKind.name} groups.` : 'No group kinds configured.'}
              </EmptyText>
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

function PositionsGroupedTable({
  sections,
  users,
  isUpdating,
  isVacating,
  isDeleting,
  onAssignHolder,
  onVacate,
  onDelete,
}: {
  sections: PositionSection[]
  users: User[]
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
        {sections.flatMap((section) => [
          <TableRow key={section.key} className="bg-muted/50 hover:bg-muted/50">
            <TableCell colSpan={4} className="py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{section.name}</span>
                <span className="text-xs text-muted-foreground">{formatCount(section.positions.length, 'position')}</span>
              </div>
            </TableCell>
          </TableRow>,
          ...section.positions.map((position) => (
            <TableRow key={`${section.key}:${position.id}`}>
              <TableCell className="font-medium">
                <Link href={`/admin/positions/${position.id}`} className="text-primary hover:underline">
                  {position.name}
                </Link>
              </TableCell>
              <TableCell>
                <MemberCombobox
                  value={position.currentHolder?.id ?? ''}
                  disabled={isUpdating}
                  users={users}
                  placeholder="Search members"
                  onValueChange={(value) => void onAssignHolder(position, value)}
                />
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
                    title="Edit position"
                    aria-label="Edit position"
                    nativeButton={false}
                    render={<Link href={`/admin/positions/${position.id}`} />}
                  >
                    <Pencil />
                  </Button>
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
          )),
        ])}
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

function groupPositionsByGroup(groups: Group[], positions: Position[], selectedKindId: string): PositionSection[] {
  const visibleGroups = groups.filter((group) => group.kindId === selectedKindId)
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const positionsByGroupId = groupPositionsByGroupId(positions.map(withUnassignedGroup))

  return [
    ...knownGroupSections(visibleGroups, positionsByGroupId),
    ...unknownGroupSections(groupsById, positionsByGroupId),
  ]
}

function withUnassignedGroup(position: Position): Position {
  return position.groupIds.length ? position : { ...position, groupIds: [unassignedGroupKey] }
}

function knownGroupSections(groups: Group[], positionsByGroupId: Map<string, Position[]>): PositionSection[] {
  return groups.flatMap((group) => {
    const positions = positionsByGroupId.get(group.id) ?? []
    return positions.length ? [{ key: group.id, name: group.name, positions }] : []
  })
}

function unknownGroupSections(
  groupsById: ReadonlyMap<string, Group>,
  positionsByGroupId: Map<string, Position[]>,
): PositionSection[] {
  return [...positionsByGroupId.entries()].flatMap(([groupId, positions]) => {
    if (groupId === unassignedGroupKey || groupsById.has(groupId)) {
      return []
    }

    return [{ key: groupId, name: 'Unknown group', positions }]
  })
}

function countSectionPositions(sections: PositionSection[]) {
  return sections.reduce((count, section) => count + section.positions.length, 0)
}

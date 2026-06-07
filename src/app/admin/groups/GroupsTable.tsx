'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import { DataState, EmptyText } from '@/app/admin/_components/data-state'
import { RefreshButton } from '@/app/admin/_components/refresh-button'
import type { Group, GroupKind } from '@/common/groups/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function GroupsTable({
  groups,
  groupKinds,
  isPending,
  isFetching,
  error,
  onRefresh,
}: {
  groups: Group[]
  groupKinds: GroupKind[]
  isPending: boolean
  isFetching: boolean
  error: unknown
  onRefresh: () => void
}) {
  const [selectedKindId, setSelectedKindId] = useState('')
  const sortedGroupKinds = useMemo(
    () => [...groupKinds].sort((left, right) => left.name.localeCompare(right.name)),
    [groupKinds],
  )
  const selectedKindIdExists = sortedGroupKinds.some((kind) => kind.id === selectedKindId)
  const effectiveKindId = selectedKindIdExists ? selectedKindId : (sortedGroupKinds[0]?.id ?? '')
  const selectedKind = sortedGroupKinds.find((kind) => kind.id === effectiveKindId) ?? null
  const groupCountsByKind = getGroupCountsByKind(groups)
  const visibleGroups = useMemo(
    () =>
      groups
        .filter((group) => group.kindId === effectiveKindId)
        .sort(
          (left, right) =>
            right.effectiveMemberCount - left.effectiveMemberCount ||
            right.directMemberCount - left.directMemberCount ||
            left.name.localeCompare(right.name),
        ),
    [effectiveKindId, groups],
  )
  const groupsById = new Map(groups.map((group) => [group.id, group]))

  return (
    <Card className="lg:row-span-2">
      <CardHeader className="grid-cols-[1fr_auto]">
        <div>
          <CardTitle>Groups</CardTitle>
          <CardDescription>
            {selectedKind ? `${selectedKind.name}: ${visibleGroups.length} configured` : 'No group kinds configured'}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={effectiveKindId}
            disabled={!sortedGroupKinds.length}
            onValueChange={(nextValue) => setSelectedKindId(nextValue ?? '')}
          >
            <SelectTrigger aria-label="Group kind" className="w-44">
              <SelectValue placeholder="Group kind">
                {(selectedValue) =>
                  sortedGroupKinds.find((kind) => kind.id === selectedValue)?.name ?? 'Group kind'
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              {sortedGroupKinds.map((kind) => (
                <SelectItem key={kind.id} value={kind.id}>
                  <span>{kind.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                    {groupCountsByKind.get(kind.id) ?? 0}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <RefreshButton isFetching={isFetching} onRefresh={onRefresh} />
        </div>
      </CardHeader>
      <CardContent>
        <DataState isPending={isPending} error={error}>
          <>
            <Table className="min-w-160">
              <TableHeader className="text-xs text-muted-foreground uppercase">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                  <TableHead>Parent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/groups/${group.id}`} className="text-primary hover:underline">
                        {group.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {group.directMemberCount} / {group.effectiveMemberCount}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {group.parentGroupId ? (groupsById.get(group.parentGroupId)?.name ?? 'Missing parent') : 'Root'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!visibleGroups.length ? (
              <EmptyText>{selectedKind ? `No ${selectedKind.name} groups configured.` : 'No group kinds configured.'}</EmptyText>
            ) : null}
          </>
        </DataState>
      </CardContent>
    </Card>
  )
}

function getGroupCountsByKind(groups: Group[]) {
  const countsByKind = new Map<string, number>()

  for (const group of groups) {
    countsByKind.set(group.kindId, (countsByKind.get(group.kindId) ?? 0) + 1)
  }

  return countsByKind
}

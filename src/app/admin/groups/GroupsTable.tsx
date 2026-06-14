'use client'

import Link from 'next/link'

import { DataState, EmptyText } from '@/app/admin/_components/data-state'
import { RefreshButton } from '@/app/admin/_components/refresh-button'
import type { Group } from '@/common/groups/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function GroupsTable({
  groups,
  isPending,
  isFetching,
  error,
  onRefresh,
}: {
  groups: Group[]
  isPending: boolean
  isFetching: boolean
  error: unknown
  onRefresh: () => void
}) {
  const groupsById = new Map(groups.map((group) => [group.id, group]))

  return (
    <Card className="lg:row-span-2">
      <CardHeader className="grid-cols-[1fr_auto]">
        <div>
          <CardTitle>Groups</CardTitle>
          <CardDescription>{groups.length} configured</CardDescription>
        </div>
        <RefreshButton isFetching={isFetching} onRefresh={onRefresh} />
      </CardHeader>
      <CardContent>
        <DataState isPending={isPending} error={error}>
          <>
            <Table className="min-w-160">
              <TableHeader className="text-xs text-muted-foreground uppercase">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>State</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/groups/${group.id}`} className="text-primary hover:underline">
                        {group.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{group.kindName ?? '-'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {group.parentGroupId ? (groupsById.get(group.parentGroupId)?.name ?? 'Missing parent') : 'Root'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{group.isContainer ? ' / Container' : ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!groups.length ? <EmptyText>No groups configured.</EmptyText> : null}
          </>
        </DataState>
      </CardContent>
    </Card>
  )
}

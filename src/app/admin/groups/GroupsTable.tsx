'use client'

import { RefreshCw } from 'lucide-react'
import Link from 'next/link'

import { getErrorMessage } from '@/common/errors/utils'
import type { Group } from '@/common/groups/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
        <Button
          variant="outline"
          size="icon"
          type="button"
          title="Refresh"
          aria-label="Refresh"
          disabled={isFetching}
          onClick={onRefresh}
        >
          <RefreshCw className={isFetching ? 'animate-spin' : undefined} />
        </Button>
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
            {!groups.length ? <p className="text-sm text-muted-foreground">No groups configured.</p> : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}

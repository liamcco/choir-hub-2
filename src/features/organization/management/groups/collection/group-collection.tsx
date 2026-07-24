'use client'

import Link from 'next/link'
import { useState } from 'react'
import { adminGroupPath } from '@/core/navigation/site'
import type { GroupKind } from '@/drizzle/schema'
import { formatGroupKind } from '@/features/organization/core/group-kind'
import { SearchControl } from '@/features/organization/management/components/search-control'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export type GroupCollectionRow = {
  id: string
  name: string
  kind: GroupKind
  parentName: string | null
  directMemberCount: number
}

export function GroupCollection({ groups }: { groups: GroupCollectionRow[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase()
  const filteredGroups = normalizedQuery
    ? groups.filter((group) => searchableGroupText(group).includes(normalizedQuery))
    : groups

  return (
    <div className="flex flex-col gap-4">
      <SearchControl
        label="Search Groups"
        query={searchQuery}
        onQueryChange={setSearchQuery}
        displayedCount={filteredGroups.length}
        totalCount={groups.length}
        resourceName="Groups"
      />
      <div className="overflow-x-auto rounded-lg border">
        <Table className="min-w-[42rem] whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.length ? (
              filteredGroups.map((group) => (
                <TableRow className="relative" key={group.id}>
                  <TableCell>
                    <Link
                      className="font-medium after:absolute after:inset-0 hover:underline focus-visible:underline"
                      href={adminGroupPath(group.id)}
                    >
                      {group.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{formatGroupKind(group.kind)}</Badge>
                  </TableCell>
                  <TableCell>
                    {group.parentName ?? <span className="text-muted-foreground">No parent Group</span>}
                  </TableCell>
                  <TableCell>{group.directMemberCount}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-24 text-center text-muted-foreground" colSpan={4}>
                  No Groups match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function searchableGroupText(group: GroupCollectionRow) {
  return [
    group.name,
    formatGroupKind(group.kind),
    group.parentName ?? 'No parent Group',
    String(group.directMemberCount),
  ]
    .join(' ')
    .toLocaleLowerCase()
}

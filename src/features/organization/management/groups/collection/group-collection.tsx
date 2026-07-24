'use client'

import Link from 'next/link'
import { useState } from 'react'
import { adminGroupPath } from '@/core/navigation/site'
import { SearchControl } from '@/features/organization/management/components/search-control'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export type GroupCollectionRow = {
  id: string
  name: string
  scope: string
  memberCount: number
}

const scopeOrder = ['CSK', 'KK', 'MK', 'DK']

export function GroupCollection({ groups }: { groups: GroupCollectionRow[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase()
  const filteredGroups = normalizedQuery
    ? groups.filter((group) => searchableGroupText(group).includes(normalizedQuery))
    : groups
  const groupedGroups = scopeOrder.flatMap((scope) => {
    const scopedGroups = filteredGroups
      .filter((group) => group.scope === scope)
      .sort((first, second) => first.name.localeCompare(second.name) || first.id.localeCompare(second.id))
    return scopedGroups.length ? [{ scope, groups: scopedGroups }] : []
  })

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
        <Table className="min-w-[32rem] whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.length ? (
              groupedGroups.flatMap(({ scope, groups: scopedGroups }) => [
                ...(scope === 'CSK'
                  ? []
                  : [
                      <TableRow key={`${scope}-heading`}>
                        <TableCell
                          className="bg-muted/30 py-2 text-xs font-semibold uppercase tracking-wide"
                          colSpan={2}
                        >
                          {scope}
                        </TableCell>
                      </TableRow>,
                    ]),
                ...scopedGroups.map((group) => (
                  <TableRow className="relative" key={group.id}>
                    <TableCell>
                      <Link
                        className="font-medium after:absolute after:inset-0 hover:underline focus-visible:underline"
                        href={adminGroupPath(group.id)}
                      >
                        {group.name}
                      </Link>
                    </TableCell>
                    <TableCell>{group.memberCount}</TableCell>
                  </TableRow>
                )),
              ])
            ) : (
              <TableRow>
                <TableCell className="h-24 text-center text-muted-foreground" colSpan={2}>
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
  return [group.name, group.scope, String(group.memberCount)].join(' ').toLocaleLowerCase()
}

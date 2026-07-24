'use client'

import Link from 'next/link'
import { useState } from 'react'
import { adminUserPath } from '@/core/navigation/site'
import type { MemberStatus } from '@/drizzle/schema'
import { formatMemberStatus } from '@/features/organization/core/member-status'
import { SearchControl } from '@/features/organization/management/components/search-control'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export type MemberCollectionRow = {
  id: string
  name: string
  homeChoir: string | null
  section: string | null
  status: MemberStatus
}

export function MemberCollection({ users }: { users: MemberCollectionRow[] }) {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filteredMembers = !normalizedQuery
    ? users
    : users.filter((user) => searchableUserText(user).includes(normalizedQuery))

  return (
    <div className="flex flex-col gap-4">
      <SearchControl
        label="Search Users"
        query={query}
        onQueryChange={setQuery}
        displayedCount={filteredMembers.length}
        totalCount={users.length}
        resourceName="Users"
      />
      <div className="overflow-x-auto rounded-lg border">
        <Table className="min-w-[42rem] whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Home Choir</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length ? (
              filteredMembers.map((user) => (
                <TableRow className="relative" key={user.id}>
                  <TableCell>
                    <Link
                      className="font-medium after:absolute after:inset-0 hover:underline focus-visible:underline"
                      href={adminUserPath(user.id)}
                    >
                      {user.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <TextValue value={user.homeChoir} fallback="No Home Choir" />
                  </TableCell>
                  <TableCell>
                    <TextValue value={user.section} fallback="No Section" />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{formatMemberStatus(user.status)}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-24 text-center text-muted-foreground" colSpan={4}>
                  No Users match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function searchableUserText(user: MemberCollectionRow) {
  return [user.name, user.homeChoir ?? 'No Home Choir', user.section ?? 'No Section', formatMemberStatus(user.status)]
    .join(' ')
    .toLocaleLowerCase()
}

function TextValue({ value, fallback }: { value: string | null; fallback: string }) {
  return value ?? <span className="text-muted-foreground">{fallback}</span>
}

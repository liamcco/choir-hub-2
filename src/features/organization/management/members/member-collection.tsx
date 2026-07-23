'use client'

import { CircleAlertIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { adminUserPath } from '@/core/navigation/site'
import { formatMemberStatus } from '@/features/organization/core/member-status'
import { SearchControl } from '@/features/organization/management/components/search-control'
import type { MemberStatus } from '@/prisma/generated/client'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export type MemberCollectionRow = {
  id: string
  name: string
  choirs: string[]
  voices: string[]
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
              <TableHead>Choir</TableHead>
              <TableHead>Voice</TableHead>
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
                    <TextValues values={user.choirs} />
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <TextValues values={user.voices} />
                      {user.voices.length > 1 ? (
                        <CircleAlertIcon
                          aria-label="Multiple current Voices"
                          className="size-4 text-amber-600"
                          role="img"
                        />
                      ) : null}
                    </span>
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
  const choirs = user.choirs.length ? user.choirs : ['Not assigned']
  const voices = user.voices.length ? user.voices : ['Not assigned']
  return [user.name, ...choirs, ...voices, formatMemberStatus(user.status)].join(' ').toLocaleLowerCase()
}

function TextValues({ values }: { values: string[] }) {
  return values.length ? values.join(', ') : <span className="text-muted-foreground">Not assigned</span>
}

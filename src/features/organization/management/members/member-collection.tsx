'use client'

import { CircleAlertIcon } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { adminMemberPath } from '@/core/navigation/site'
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

export function MemberCollection({ members }: { members: MemberCollectionRow[] }) {
  const [query, setQuery] = useState('')
  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    if (!normalizedQuery) return members
    return members.filter((member) => searchableMemberText(member).includes(normalizedQuery))
  }, [members, query])

  return (
    <div className="flex flex-col gap-4">
      <SearchControl
        label="Search Members"
        query={query}
        onQueryChange={setQuery}
        displayedCount={filteredMembers.length}
        totalCount={members.length}
        resourceName="Members"
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
              filteredMembers.map((member) => (
                <TableRow className="relative" key={member.id}>
                  <TableCell>
                    <Link
                      className="font-medium after:absolute after:inset-0 hover:underline focus-visible:underline"
                      href={adminMemberPath(member.id)}
                    >
                      {member.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <TextValues values={member.choirs} />
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <TextValues values={member.voices} />
                      {member.voices.length > 1 ? (
                        <CircleAlertIcon
                          aria-label="Multiple current Voices"
                          className="size-4 text-amber-600"
                          role="img"
                        />
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{formatMemberStatus(member.status)}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-24 text-center text-muted-foreground" colSpan={4}>
                  No Members match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function searchableMemberText(member: MemberCollectionRow) {
  const choirs = member.choirs.length ? member.choirs : ['Not assigned']
  const voices = member.voices.length ? member.voices : ['Not assigned']
  return [member.name, ...choirs, ...voices, formatMemberStatus(member.status)].join(' ').toLocaleLowerCase()
}

function TextValues({ values }: { values: string[] }) {
  return values.length ? values.join(', ') : <span className="text-muted-foreground">Not assigned</span>
}

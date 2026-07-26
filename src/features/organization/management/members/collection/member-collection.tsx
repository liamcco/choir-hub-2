'use client'

import Link from 'next/link'
import { Fragment, useMemo, useState } from 'react'
import { adminUserPath } from '@/core/navigation/site'
import { ChoirId, getChoir } from '@/core/topology'
import { type FineVoice, isFineVoice, voiceOrder } from '@/core/types'
import type { MemberStatus } from '@/drizzle/schema'
import { formatMemberStatus } from '@/features/organization/core/member-status'
import { SearchControl } from '@/features/organization/management/components/search-control'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { cn } from '@/shared/utils'

export type MemberCollectionRow = {
  id: string
  name: string
  homeChoir: string | null
  voice: FineVoice | null
  status: MemberStatus
}

type MemberGrouping = 'name' | 'status' | 'voice' | 'choir'

const GROUPING_LABELS: Record<MemberGrouping, string> = {
  name: 'Name',
  choir: 'Choir',
  voice: 'Voice',
  status: 'Status',
}

const STATUS_ORDER: MemberStatus[] = ['ACTIVE', 'PASSIVE', 'FORMER']
const CHOIR_ORDER = [ChoirId.MK, ChoirId.KK, ChoirId.DK].flatMap((id) => {
  const choir = getChoir(id)
  return choir ? [choir.shortName] : []
})

export function MemberCollection({ users }: { users: MemberCollectionRow[] }) {
  const [query, setQuery] = useState('')
  const [grouping, setGrouping] = useState<MemberGrouping>('name')
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filteredMembers = !normalizedQuery
    ? users
    : users.filter((user) => searchableUserText(user).includes(normalizedQuery))
  const visibleMembers = useMemo(() => sortMembers(filteredMembers), [filteredMembers])
  const groupedMembers = grouping === 'name' ? null : groupMembers(visibleMembers, grouping)

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
              {(['name', 'choir', 'voice', 'status'] as const).map((column) => (
                <TableHead key={column}>
                  <button
                    aria-pressed={grouping === column}
                    className={cn(
                      '-mx-2 rounded-md px-2 py-1 text-left font-medium transition-colors hover:bg-muted',
                      column === 'name' && 'ml-px',
                      grouping === column && 'bg-muted text-foreground',
                    )}
                    onClick={() => setGrouping(column)}
                    type="button"
                  >
                    {GROUPING_LABELS[column]}
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleMembers.length ? (
              groupedMembers ? (
                groupedMembers.map(({ label, members }) => (
                  <Fragment key={label}>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableCell className="py-2 text-xs font-semibold uppercase tracking-wide" colSpan={4}>
                        {label}
                      </TableCell>
                    </TableRow>
                    {grouping === 'choir'
                      ? groupMembers(members, 'voice').flatMap(({ label: voiceLabel, members: voiceMembers }) => [
                          <TableRow className="bg-muted/10 hover:bg-muted/10" key={`${label}-${voiceLabel}-heading`}>
                            <TableCell className="py-2 pl-6 text-xs font-medium text-muted-foreground" colSpan={4}>
                              {voiceLabel}
                            </TableCell>
                          </TableRow>,
                          ...voiceMembers.map((user) => <MemberRow key={user.id} user={user} />),
                        ])
                      : members.map((user) => <MemberRow key={user.id} user={user} />)}
                  </Fragment>
                ))
              ) : (
                visibleMembers.map((user) => <MemberRow key={user.id} user={user} />)
              )
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

function MemberRow({ user }: { user: MemberCollectionRow }) {
  return (
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
        <TextValue value={user.homeChoir} fallback="No Choir" />
      </TableCell>
      <TableCell>
        <TextValue value={user.voice} fallback="No Voice" />
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{formatMemberStatus(user.status)}</Badge>
      </TableCell>
    </TableRow>
  )
}

function sortMembers(members: MemberCollectionRow[]) {
  return [...members].sort(
    (first, second) => first.name.localeCompare(second.name) || first.id.localeCompare(second.id),
  )
}

function groupMembers(members: MemberCollectionRow[], grouping: Exclude<MemberGrouping, 'name'>) {
  const groups = new Map<string, MemberCollectionRow[]>()
  for (const member of members) {
    const label = getGroupingValue(member, grouping)
    const group = groups.get(label) ?? []
    group.push(member)
    groups.set(label, group)
  }

  return [...groups.entries()]
    .sort(([first], [second]) => compareGroupLabels(first, second, grouping))
    .map(([label, group]) => ({ label, members: group }))
}

function getGroupingValue(member: MemberCollectionRow, grouping: Exclude<MemberGrouping, 'name'>) {
  if (grouping === 'status') return formatMemberStatus(member.status)
  if (grouping === 'voice') return member.voice ?? 'No Voice'
  return member.homeChoir ?? 'No Choir'
}

function compareGroupLabels(first: string, second: string, grouping: Exclude<MemberGrouping, 'name'>) {
  if (grouping === 'status') {
    return statusIndex(first) - statusIndex(second)
  }
  if (grouping === 'voice') {
    return voiceIndex(first) - voiceIndex(second)
  }
  return choirIndex(first) - choirIndex(second)
}

function statusIndex(label: string) {
  const index = STATUS_ORDER.findIndex((status) => formatMemberStatus(status) === label)
  return index === -1 ? STATUS_ORDER.length : index
}

function voiceIndex(label: string) {
  return isFineVoice(label) ? voiceOrder(label) : Number.POSITIVE_INFINITY
}

function choirIndex(label: string) {
  const index = CHOIR_ORDER.indexOf(label)
  return index === -1 ? CHOIR_ORDER.length : index
}

function searchableUserText(user: MemberCollectionRow) {
  return [user.name, user.homeChoir ?? 'No Choir', user.voice ?? 'No Voice', formatMemberStatus(user.status)]
    .join(' ')
    .toLocaleLowerCase()
}

function TextValue({ value, fallback }: { value: string | null; fallback: string }) {
  return value ?? <span className="text-muted-foreground">{fallback}</span>
}

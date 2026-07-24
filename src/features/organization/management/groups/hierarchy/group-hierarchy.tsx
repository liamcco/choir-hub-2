'use client'

import Link from 'next/link'
import { useState } from 'react'
import { adminGroupPath } from '@/core/navigation/site'
import { formatGroupKind } from '@/features/organization/core/group-kind'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import type { GroupHierarchyRow } from '../query'

type MemberPopulation = 'all' | 'active' | 'passive'

export function GroupHierarchy({ groups }: { groups: GroupHierarchyRow[] }) {
  const [population, setPopulation] = useState<MemberPopulation>('all')
  const [includeFormer, setIncludeFormer] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">Member status</p>
          <div aria-label="Member status" className="flex w-full sm:w-auto" role="group">
            {(['all', 'active', 'passive'] as const).map((option) => (
              <Button
                aria-pressed={population === option}
                className="flex-1 rounded-none first:rounded-l-lg last:rounded-r-lg sm:flex-none"
                key={option}
                onClick={() => setPopulation(option)}
                size="sm"
                type="button"
                variant={population === option ? 'default' : 'outline'}
              >
                {option === 'all' ? 'All' : option[0].toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox checked={includeFormer} id="include-former-members" onCheckedChange={setIncludeFormer} />
          <Label htmlFor="include-former-members">Include former Members</Label>
        </div>
      </div>
      <div className="rounded-lg border">
        <Table className="min-w-[34rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Group</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead className="text-right">Members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>
                  <Link
                    className="block min-w-max font-medium hover:underline focus-visible:underline"
                    href={adminGroupPath(group.id)}
                    style={{ paddingInlineStart: `${group.depth * 1.25}rem` }}
                  >
                    {group.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{formatGroupKind(group.kind)}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {filteredMemberCount(group, population, includeFormer)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function filteredMemberCount(group: GroupHierarchyRow, population: MemberPopulation, includeFormer: boolean) {
  const counts = group.memberCounts
  const current = selectedStatuses[population].reduce((total, status) => total + counts[status], 0)
  return current + (includeFormer ? counts.FORMER : 0)
}

const selectedStatuses: Record<MemberPopulation, ('ACTIVE' | 'PASSIVE')[]> = {
  all: ['ACTIVE', 'PASSIVE'],
  active: ['ACTIVE'],
  passive: ['PASSIVE'],
}

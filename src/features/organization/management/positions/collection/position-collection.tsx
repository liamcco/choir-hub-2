'use client'

import Link from 'next/link'
import { Fragment, useState } from 'react'
import { adminPositionPath } from '@/core/navigation/site'
import { SearchControl } from '@/features/organization/management/components/search-control'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

const POSITION_GROUP_ORDER = ['Board', 'KK', 'MK', 'DK', 'Other'] as const

export type PositionCollectionRow = {
  id: string
  name: string
  group: string
  scopeLabel: string
  currentHolder: string | null
  heldSince: Date | null
}

export function PositionCollection({ positions }: { positions: PositionCollectionRow[] }) {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filteredPositions = !normalizedQuery
    ? positions
    : positions.filter((position) => searchablePositionText(position).includes(normalizedQuery))
  const groupedPositions = POSITION_GROUP_ORDER.flatMap((group) => {
    const groupPositions = filteredPositions.filter((position) => position.group === group)
    return groupPositions.length ? [{ group, positions: groupPositions }] : []
  })

  return (
    <div className="flex flex-col gap-4">
      <SearchControl
        label="Search Positions"
        query={query}
        onQueryChange={setQuery}
        displayedCount={filteredPositions.length}
        totalCount={positions.length}
        resourceName="Positions"
      />
      <div className="overflow-x-auto rounded-lg border">
        <Table className="min-w-[42rem] whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Group scope</TableHead>
              <TableHead>Current holder</TableHead>
              <TableHead>Held since</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPositions.length ? (
              groupedPositions.map(({ group, positions: groupPositions }) => (
                <Fragment key={group}>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableCell className="font-semibold" colSpan={4}>
                      {group}
                    </TableCell>
                  </TableRow>
                  {groupPositions.map((position) => (
                    <TableRow className="relative" key={position.id}>
                      <TableCell>
                        <Link
                          className="font-medium after:absolute after:inset-0 hover:underline focus-visible:underline"
                          href={adminPositionPath(position.id)}
                        >
                          {position.name}
                        </Link>
                      </TableCell>
                      <TableCell>{position.scopeLabel}</TableCell>
                      <TableCell>{position.currentHolder ?? <EmptyValue />}</TableCell>
                      <TableCell>{position.heldSince ? formatDate(position.heldSince) : <EmptyValue />}</TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-24 text-center text-muted-foreground" colSpan={4}>
                  No Positions match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
function EmptyValue() {
  return <span className="text-muted-foreground">Vacant</span>
}
function searchablePositionText(position: PositionCollectionRow) {
  return [
    position.name,
    position.group,
    position.scopeLabel,
    position.currentHolder ?? 'Vacant',
    position.heldSince ? formatDate(position.heldSince) : 'Vacant',
  ]
    .join(' ')
    .toLocaleLowerCase()
}
function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date)
}

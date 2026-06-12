'use client'

import type { Group, Membership, Person, Position } from '@/common/groups/types'

import { CreatePositionCard } from './CreatePositionCard'
import { PositionsTable } from './PositionsTable'

export function PositionsAdmin({
  group,
  positions,
  memberships,
  people,
  isPending,
  error,
  onPositionsChanged,
}: {
  group: Group | null
  positions: Position[]
  memberships: Membership[]
  people: Person[]
  isPending: boolean
  error: unknown
  onPositionsChanged: () => Promise<unknown>
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <CreatePositionCard group={group} memberships={memberships} people={people} onChanged={onPositionsChanged} />
      <PositionsTable
        group={group}
        positions={positions}
        memberships={memberships}
        people={people}
        isPending={isPending}
        error={error}
        onChanged={onPositionsChanged}
      />
    </div>
  )
}

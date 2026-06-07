'use client'

import type { Group, GroupKind } from '@/common/groups/types'

import { GroupsTable } from './GroupsTable'

type GroupsQueryState = {
  isPending: boolean
  isFetching: boolean
  error: unknown
  refetch: () => Promise<unknown>
}

export function GroupsAdmin({
  groups,
  groupKinds,
  groupsQuery,
}: {
  groups: Group[]
  groupKinds: GroupKind[]
  groupsQuery: GroupsQueryState
}) {
  return (
    <div className="grid gap-6">
      <GroupsTable
        groups={groups}
        groupKinds={groupKinds}
        isPending={groupsQuery.isPending}
        isFetching={groupsQuery.isFetching}
        error={groupsQuery.error}
        onRefresh={() => {
          void groupsQuery.refetch()
        }}
      />
    </div>
  )
}

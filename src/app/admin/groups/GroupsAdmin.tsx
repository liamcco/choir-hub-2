'use client'

import type { Group } from '@/common/groups/types'

import { GroupsTable } from './GroupsTable'
import { OrgStructure } from './OrgStructure'

type GroupsQueryState = {
  isPending: boolean
  isFetching: boolean
  error: unknown
  refetch: () => Promise<unknown>
}

export function GroupsAdmin({
  groups,
  groupsQuery,
}: {
  groups: Group[]
  groupsQuery: GroupsQueryState
}) {
  return (
    <div className="grid gap-6">
      <GroupsTable
        groups={groups}
        isPending={groupsQuery.isPending}
        isFetching={groupsQuery.isFetching}
        error={groupsQuery.error}
        onRefresh={() => {
          void groupsQuery.refetch()
        }}
      />
      <OrgStructure groups={groups} />
    </div>
  )
}

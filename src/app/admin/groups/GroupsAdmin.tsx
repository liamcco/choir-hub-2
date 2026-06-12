'use client'

import type { Group, GroupKind } from '@/common/groups/types'

import { CreateGroupCard } from './CreateGroupCard'
import { GroupsTable } from './GroupsTable'
import { OrgStructure } from './OrgStructure'

type GroupsQueryState = {
  isPending: boolean
  isFetching: boolean
  error: unknown
  refetch: () => Promise<unknown>
}

export function GroupsAdmin({
  groupKinds,
  groups,
  groupsQuery,
  onGroupsChanged,
}: {
  groupKinds: GroupKind[]
  groups: Group[]
  groupsQuery: GroupsQueryState
  onGroupsChanged: () => Promise<unknown>
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <CreateGroupCard
        groupKinds={groupKinds}
        groups={groups}
        onChanged={async () => {
          await onGroupsChanged()
        }}
      />
      <GroupsTable
        groups={groups}
        isPending={groupsQuery.isPending}
        isFetching={groupsQuery.isFetching}
        error={groupsQuery.error}
        onRefresh={() => {
          void groupsQuery.refetch()
        }}
      />
      <div className="lg:col-start-2">
        <OrgStructure groups={groups} />
      </div>
    </div>
  )
}

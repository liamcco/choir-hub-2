'use client'

import type { Group, GroupKind } from '@/common/groups/types'

import { CreateGroupCard } from './CreateGroupCard'
import { GroupSettingsCard } from './GroupSettingsCard'
import { GroupsTable } from './GroupsTable'

type GroupsQueryState = {
  isPending: boolean
  isFetching: boolean
  error: unknown
  refetch: () => Promise<unknown>
}

export function GroupsAdmin({
  groupKinds,
  groups,
  selectedGroup,
  selectedGroupId,
  groupsQuery,
  onSelectGroup,
  onGroupsChanged,
}: {
  groupKinds: GroupKind[]
  groups: Group[]
  selectedGroup: Group | null
  selectedGroupId: string | null
  groupsQuery: GroupsQueryState
  onSelectGroup: (id: string) => void
  onGroupsChanged: () => Promise<unknown>
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <CreateGroupCard
        groupKinds={groupKinds}
        groups={groups}
        onChanged={async (createdGroupId) => {
          await onGroupsChanged()
          onSelectGroup(createdGroupId)
        }}
      />
      <GroupsTable
        groups={groups}
        selectedGroupId={selectedGroupId}
        isPending={groupsQuery.isPending}
        isFetching={groupsQuery.isFetching}
        error={groupsQuery.error}
        onSelectGroup={onSelectGroup}
        onRefresh={() => {
          void groupsQuery.refetch()
        }}
      />
      <GroupSettingsCard group={selectedGroup} groupKinds={groupKinds} groups={groups} onChanged={onGroupsChanged} />
    </div>
  )
}

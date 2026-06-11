'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BriefcaseBusiness, FolderTree, Layers, UserPlus } from 'lucide-react'

import {
  getDirectGroupMembershipsOptions,
  getDirectGroupMembershipsQueryKey,
  getEffectiveGroupMembersOptions,
  getEffectiveGroupMembersQueryKey,
  getGroupKindsOptions,
  getGroupKindsQueryKey,
  getGroupPositionsOptions,
  getGroupPositionsQueryKey,
  getGroupsOptions,
  getGroupsQueryKey,
  getPeopleOptions,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { GroupsAdmin } from './GroupsAdmin'
import { GroupKindsAdmin } from './GroupKindsAdmin'
import { MembershipsAdmin } from './MembershipsAdmin'
import { PositionsAdmin } from './PositionsAdmin'

export function AdminGroupsPanel() {
  const queryClient = useQueryClient()
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  const groupKindsQuery = useQuery(getGroupKindsOptions())
  const groupsQuery = useQuery(getGroupsOptions())
  const peopleQuery = useQuery(getPeopleOptions())
  const groupKinds = groupKindsQuery.data?.groupKinds ?? []
  const groups = groupsQuery.data?.groups ?? []
  const people = peopleQuery.data?.people ?? []
  const effectiveSelectedGroupId = groups.some((group) => group.id === selectedGroupId)
    ? selectedGroupId
    : (groups[0]?.id ?? null)
  const membershipsQuery = useQuery({
    ...getDirectGroupMembershipsOptions({ path: { id: effectiveSelectedGroupId ?? '' } }),
    enabled: Boolean(effectiveSelectedGroupId),
  })
  const effectiveMembersQuery = useQuery({
    ...getEffectiveGroupMembersOptions({ path: { id: effectiveSelectedGroupId ?? '' } }),
    enabled: Boolean(effectiveSelectedGroupId),
  })
  const positionsQuery = useQuery({
    ...getGroupPositionsOptions({ path: { id: effectiveSelectedGroupId ?? '' } }),
    enabled: Boolean(effectiveSelectedGroupId),
  })

  const memberships = membershipsQuery.data?.memberships ?? []
  const positions = positionsQuery.data?.positions ?? []
  const selectedGroup = groups.find((group) => group.id === effectiveSelectedGroupId) ?? null

  const invalidateKinds = () => queryClient.invalidateQueries({ queryKey: getGroupKindsQueryKey() })
  const invalidateGroups = () => queryClient.invalidateQueries({ queryKey: getGroupsQueryKey() })
  const invalidateSelectedMemberships = () => {
    if (!effectiveSelectedGroupId) {
      return Promise.resolve()
    }

    return Promise.all([
      queryClient.invalidateQueries({ queryKey: getDirectGroupMembershipsQueryKey({ path: { id: effectiveSelectedGroupId } }) }),
      queryClient.invalidateQueries({ queryKey: getEffectiveGroupMembersQueryKey({ path: { id: effectiveSelectedGroupId } }) }),
      queryClient.invalidateQueries({ queryKey: getGroupPositionsQueryKey({ path: { id: effectiveSelectedGroupId } }) }),
    ])
  }
  const invalidateSelectedPositions = () => {
    if (!effectiveSelectedGroupId) {
      return Promise.resolve()
    }

    return queryClient.invalidateQueries({ queryKey: getGroupPositionsQueryKey({ path: { id: effectiveSelectedGroupId } }) })
  }

  return (
    <Tabs defaultValue="groups" className="gap-4">
      <TabsList>
        <TabsTrigger value="groups">
          <FolderTree />
          Groups
        </TabsTrigger>
        <TabsTrigger value="kinds">
          <Layers />
          Kinds
        </TabsTrigger>
        <TabsTrigger value="memberships" disabled={!selectedGroup}>
          <UserPlus />
          Memberships
        </TabsTrigger>
        <TabsTrigger value="positions" disabled={!selectedGroup}>
          <BriefcaseBusiness />
          Positions
        </TabsTrigger>
      </TabsList>

      <TabsContent value="groups">
        <GroupsAdmin
          groupKinds={groupKinds}
          groups={groups}
          selectedGroup={selectedGroup}
          selectedGroupId={effectiveSelectedGroupId}
          groupsQuery={groupsQuery}
          onSelectGroup={setSelectedGroupId}
          onGroupsChanged={invalidateGroups}
        />
      </TabsContent>

      <TabsContent value="kinds">
        <GroupKindsAdmin
          groupKinds={groupKinds}
          groups={groups}
          isPending={groupKindsQuery.isPending}
          error={groupKindsQuery.error}
          onKindsChanged={invalidateKinds}
        />
      </TabsContent>

      <TabsContent value="memberships">
        <MembershipsAdmin
          group={selectedGroup}
          people={people}
          memberships={memberships}
          effectiveCount={effectiveMembersQuery.data?.members.length ?? 0}
          isPending={Boolean(effectiveSelectedGroupId) && membershipsQuery.isPending}
          error={membershipsQuery.error ?? effectiveMembersQuery.error}
          onMembershipsChanged={invalidateSelectedMemberships}
        />
      </TabsContent>

      <TabsContent value="positions">
        <PositionsAdmin
          group={selectedGroup}
          positions={positions}
          memberships={memberships}
          people={people}
          isPending={Boolean(effectiveSelectedGroupId) && positionsQuery.isPending}
          error={positionsQuery.error}
          onPositionsChanged={invalidateSelectedPositions}
        />
      </TabsContent>
    </Tabs>
  )
}

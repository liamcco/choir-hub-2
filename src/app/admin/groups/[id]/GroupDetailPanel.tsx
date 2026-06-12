'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getDirectGroupMembershipsOptions,
  getDirectGroupMembershipsQueryKey,
  getEffectiveGroupMembersOptions,
  getEffectiveGroupMembersQueryKey,
  getGroupByIdOptions,
  getGroupByIdQueryKey,
  getGroupKindsOptions,
  getGroupsOptions,
  getGroupsQueryKey,
  getGroupPositionsQueryKey,
  getPeopleOptions,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { AsyncState } from '@/common/ui/async-state'
import { GroupSettingsCard } from '../GroupSettingsCard'
import { MembershipsAdmin } from '../MembershipsAdmin'

export function GroupDetailPanel({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient()
  const groupQuery = useQuery(getGroupByIdOptions({ path: { id: groupId } }))
  const groupsQuery = useQuery(getGroupsOptions())
  const groupKindsQuery = useQuery(getGroupKindsOptions())
  const peopleQuery = useQuery(getPeopleOptions())
  const membershipsQuery = useQuery(getDirectGroupMembershipsOptions({ path: { id: groupId } }))
  const effectiveMembersQuery = useQuery(getEffectiveGroupMembersOptions({ path: { id: groupId } }))

  const invalidateGroup = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: getGroupByIdQueryKey({ path: { id: groupId } }) }),
      queryClient.invalidateQueries({ queryKey: getGroupsQueryKey() }),
    ])

  const invalidateMemberships = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: getDirectGroupMembershipsQueryKey({ path: { id: groupId } }) }),
      queryClient.invalidateQueries({ queryKey: getEffectiveGroupMembersQueryKey({ path: { id: groupId } }) }),
      queryClient.invalidateQueries({ queryKey: getGroupPositionsQueryKey({ path: { id: groupId } }) }),
    ])

  return (
    <AsyncState isPending={groupQuery.isPending} error={groupQuery.error}>
      <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
        <GroupSettingsCard
          group={groupQuery.data ?? null}
          groupKinds={groupKindsQuery.data?.groupKinds ?? []}
          groups={groupsQuery.data?.groups ?? []}
          onChanged={invalidateGroup}
        />
        <MembershipsAdmin
          group={groupQuery.data ?? null}
          people={peopleQuery.data?.people ?? []}
          memberships={membershipsQuery.data?.memberships ?? []}
          effectiveCount={effectiveMembersQuery.data?.members.length ?? 0}
          isPending={membershipsQuery.isPending}
          error={membershipsQuery.error ?? effectiveMembersQuery.error}
          onMembershipsChanged={invalidateMemberships}
        />
      </div>
    </AsyncState>
  )
}

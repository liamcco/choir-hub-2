'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getGroupByIdOptions,
  getGroupByIdQueryKey,
  getGroupKindsOptions,
  getGroupMembersOptions,
  getGroupMembersQueryKey,
  getGroupPositionsQueryKey,
  getGroupsOptions,
  getGroupsQueryKey,
  getUsersOptions,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { LoadingRows } from '@/app/admin/_components/data-state'
import { getErrorMessage } from '@/common/errors/utils'
import { GroupSettingsCard } from './GroupSettingsCard'
import { MembershipsAdmin } from './MembershipsAdmin'

export function GroupDetailPanel({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient()
  const groupQuery = useQuery(getGroupByIdOptions({ path: { groupId } }))
  const groupsQuery = useQuery(getGroupsOptions())
  const groupKindsQuery = useQuery(getGroupKindsOptions())
  const usersQuery = useQuery(getUsersOptions())
  const effectiveMembersQuery = useQuery(getGroupMembersOptions({ path: { groupId } }))
  const directMembershipsQuery = useQuery(
    getGroupMembersOptions({ path: { groupId }, query: { onlyDirectMembers: true } }),
  )

  const invalidateGroup = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: getGroupByIdQueryKey({ path: { groupId } }) }),
      queryClient.invalidateQueries({ queryKey: getGroupsQueryKey() }),
    ])

  const invalidateMemberships = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: getGroupMembersQueryKey({ path: { groupId }, query: { onlyDirectMembers: true } }),
      }),
      queryClient.invalidateQueries({ queryKey: getGroupMembersQueryKey({ path: { groupId } }) }),
      queryClient.invalidateQueries({ queryKey: getGroupPositionsQueryKey({ path: { groupId } }) }),
    ])

  if (groupQuery.isPending) {
    return <LoadingRows />
  }

  const groupError = getErrorMessage(groupQuery.error)

  if (groupError) {
    return <p className="text-sm text-destructive">{groupError}</p>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <GroupSettingsCard
        group={groupQuery.data ?? null}
        groupKinds={groupKindsQuery.data ?? []}
        groups={groupsQuery.data ?? []}
        onChanged={invalidateGroup}
      />
      <MembershipsAdmin
        group={groupQuery.data ?? null}
        users={usersQuery.data ?? []}
        members={directMembershipsQuery.data ?? []}
        isPending={directMembershipsQuery.isPending}
        error={directMembershipsQuery.error ?? effectiveMembersQuery.error}
        onMembershipsChanged={invalidateMemberships}
      />
    </div>
  )
}

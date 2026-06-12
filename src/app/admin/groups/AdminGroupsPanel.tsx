'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getGroupKindsOptions,
  getGroupsOptions,
  getGroupsQueryKey,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { GroupsAdmin } from './GroupsAdmin'

export function AdminGroupsPanel() {
  const queryClient = useQueryClient()
  const groupKindsQuery = useQuery(getGroupKindsOptions())
  const groupsQuery = useQuery(getGroupsOptions())
  const groupKinds = groupKindsQuery.data?.groupKinds ?? []
  const groups = groupsQuery.data?.groups ?? []

  const invalidateGroups = () => queryClient.invalidateQueries({ queryKey: getGroupsQueryKey() })

  return (
    <GroupsAdmin
      groupKinds={groupKinds}
      groups={groups}
      groupsQuery={groupsQuery}
      onGroupsChanged={invalidateGroups}
    />
  )
}

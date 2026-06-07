'use client'

import { useQuery } from '@tanstack/react-query'

import { getGroupKindsOptions, getGroupsOptions } from '@/lib/api-client/@tanstack/react-query.gen'

import { GroupsAdmin } from './GroupsAdmin'

export function AdminGroupsPanel() {
  const groupsQuery = useQuery(getGroupsOptions())
  const groupKindsQuery = useQuery(getGroupKindsOptions())
  const groups = groupsQuery.data ?? []
  const groupKinds = groupKindsQuery.data ?? []

  return (
    <GroupsAdmin
      groups={groups}
      groupKinds={groupKinds}
      groupsQuery={{
        isPending: groupsQuery.isPending || groupKindsQuery.isPending,
        isFetching: groupsQuery.isFetching || groupKindsQuery.isFetching,
        error: groupsQuery.error ?? groupKindsQuery.error,
        refetch: async () => {
          await Promise.all([groupsQuery.refetch(), groupKindsQuery.refetch()])
        },
      }}
    />
  )
}

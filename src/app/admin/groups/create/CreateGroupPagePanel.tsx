'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { getGroupKindsOptions, getGroupsOptions, getGroupsQueryKey } from '@/lib/api-client/@tanstack/react-query.gen'

import { CreateGroupCard } from './CreateGroupCard'

export function CreateGroupPagePanel() {
  const queryClient = useQueryClient()
  const groupKindsQuery = useQuery(getGroupKindsOptions())
  const groupsQuery = useQuery(getGroupsOptions())
  const invalidateGroups = () => queryClient.invalidateQueries({ queryKey: getGroupsQueryKey() })

  return (
    <CreateGroupCard
      groupKinds={groupKindsQuery.data?.groupKinds ?? []}
      groups={groupsQuery.data?.groups ?? []}
      onChanged={async () => {
        await invalidateGroups()
      }}
    />
  )
}

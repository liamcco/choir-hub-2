'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getGroupKindsOptions,
  getGroupKindsQueryKey,
  getGroupsOptions,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { GroupKindsAdmin } from './GroupKindsAdmin'

export function GroupKindsPagePanel() {
  const queryClient = useQueryClient()
  const groupKindsQuery = useQuery(getGroupKindsOptions())
  const groupsQuery = useQuery(getGroupsOptions())
  const invalidateKinds = () => queryClient.invalidateQueries({ queryKey: getGroupKindsQueryKey() })

  return (
    <GroupKindsAdmin
      groupKinds={groupKindsQuery.data?.groupKinds ?? []}
      groups={groupsQuery.data?.groups ?? []}
      isPending={groupKindsQuery.isPending}
      error={groupKindsQuery.error}
      onKindsChanged={invalidateKinds}
    />
  )
}

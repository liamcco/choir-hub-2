'use client'

import { useQuery } from '@tanstack/react-query'

import { getGroupsOptions, getPositionsOptions } from '@/lib/api-client/@tanstack/react-query.gen'

import { GroupsAdmin } from './GroupsAdmin'

export function AdminGroupsPanel() {
  const groupsQuery = useQuery(getGroupsOptions())
  const positionsQuery = useQuery(getPositionsOptions())
  const groups = groupsQuery.data ?? []
  const positions = positionsQuery.data ?? []

  return <GroupsAdmin groups={groups} groupsQuery={groupsQuery} positions={positions} />
}

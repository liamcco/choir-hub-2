'use client'

import { useQuery } from '@tanstack/react-query'

import { getGroupsOptions } from '@/lib/api-client/@tanstack/react-query.gen'

import { GroupsAdmin } from './GroupsAdmin'

export function AdminGroupsPanel() {
  const groupsQuery = useQuery(getGroupsOptions())
  const groups = groupsQuery.data ?? []

  return <GroupsAdmin groups={groups} groupsQuery={groupsQuery} />
}

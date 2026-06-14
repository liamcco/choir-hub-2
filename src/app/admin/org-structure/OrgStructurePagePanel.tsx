'use client'

import { useQuery } from '@tanstack/react-query'

import { getGroupsOptions, getPositionsOptions } from '@/lib/api-client/@tanstack/react-query.gen'

import { DataState } from '@/app/admin/_components/data-state'

import { OrgStructure } from './OrgStructure'

export function OrgStructurePagePanel() {
  const groupsQuery = useQuery(getGroupsOptions())
  const positionsQuery = useQuery(getPositionsOptions())

  return (
    <DataState
      isPending={groupsQuery.isPending || positionsQuery.isPending}
      error={groupsQuery.error ?? positionsQuery.error}
    >
      <OrgStructure groups={groupsQuery.data ?? []} positions={positionsQuery.data ?? []} />
    </DataState>
  )
}

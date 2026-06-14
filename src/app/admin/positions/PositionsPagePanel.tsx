'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getGroupsOptions,
  getPositionsOptions,
  getPositionsQueryKey,
  getUsersOptions,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { PositionsTable } from './PositionsTable'

export function PositionsPagePanel() {
  const queryClient = useQueryClient()
  const groupsQuery = useQuery(getGroupsOptions())
  const positionsQuery = useQuery(getPositionsOptions())
  const usersQuery = useQuery(getUsersOptions())

  const invalidatePositions = () => queryClient.invalidateQueries({ queryKey: getPositionsQueryKey() })

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <PositionsTable
          groups={groupsQuery.data ?? []}
          positions={positionsQuery.data ?? []}
          users={usersQuery.data ?? []}
          isPending={groupsQuery.isPending || positionsQuery.isPending || usersQuery.isPending}
          error={groupsQuery.error ?? positionsQuery.error ?? usersQuery.error}
          onChanged={invalidatePositions}
        />
      </div>
    </div>
  )
}

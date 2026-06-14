'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getGroupsOptions,
  getPositionsQueryKey,
  getUsersOptions,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { DataState } from '@/app/admin/_components/data-state'

import { CreatePositionCard } from './CreatePositionCard'

export function CreatePositionPagePanel() {
  const queryClient = useQueryClient()
  const groupsQuery = useQuery(getGroupsOptions())
  const usersQuery = useQuery(getUsersOptions())
  const invalidatePositions = () => queryClient.invalidateQueries({ queryKey: getPositionsQueryKey() })

  return (
    <div className="space-y-6">
      <DataState isPending={groupsQuery.isPending || usersQuery.isPending} error={groupsQuery.error ?? usersQuery.error}>
        <CreatePositionCard
          groups={groupsQuery.data ?? []}
          users={usersQuery.data ?? []}
          onCreated={invalidatePositions}
        />
      </DataState>
    </div>
  )
}

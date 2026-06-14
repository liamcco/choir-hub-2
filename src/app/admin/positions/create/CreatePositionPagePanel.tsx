'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getGroupPositionsQueryKey,
  getGroupsOptions,
  getUsersOptions,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { useGroupSelection } from '@/app/admin/_hooks/use-group-selection'
import { ControlledFieldSelect } from '@/components/forms/controlled-field-select'

import { CreatePositionCard } from './CreatePositionCard'

export function CreatePositionPagePanel() {
  const queryClient = useQueryClient()
  const groupsQuery = useQuery(getGroupsOptions())
  const usersQuery = useQuery(getUsersOptions())
  const groups = groupsQuery.data ?? []
  const { effectiveGroupId, groupSections, selectedGroup, setSelectedGroupId } = useGroupSelection(groups)
  const invalidatePositions = () =>
    effectiveGroupId
      ? queryClient.invalidateQueries({ queryKey: getGroupPositionsQueryKey({ path: { groupId: effectiveGroupId } }) })
      : Promise.resolve()

  return (
    <div className="space-y-6">
      <ControlledFieldSelect
        id="create-position-group"
        label="Group"
        sections={groupSections}
        getValue={(group) => group.id}
        getLabel={(group) => group.name}
        placeholder="Select group"
        value={effectiveGroupId}
        onValueChange={setSelectedGroupId}
      />
      <CreatePositionCard
        group={selectedGroup}
        groups={groups}
        users={usersQuery.data ?? []}
        onChanged={invalidatePositions}
      />
    </div>
  )
}

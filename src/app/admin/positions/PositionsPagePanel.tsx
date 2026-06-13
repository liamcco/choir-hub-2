'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import {
  getGroupPositionsOptions,
  getGroupPositionsQueryKey,
  getGroupsOptions,
  getPeopleOptions,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { groupSectionsByKind } from '@/common/groups/utils'
import { ControlledFieldSelect } from '@/components/forms/controlled-field-select'

import { PositionsTable } from './PositionsTable'

export function PositionsPagePanel() {
  // Featch groups and people
  const queryClient = useQueryClient()
  const groupsQuery = useQuery(getGroupsOptions())
  const peopleQuery = useQuery(getPeopleOptions())

  // All groups
  const groups = groupsQuery.data ?? []
  const groupSections = groupSectionsByKind(groups)

  // Keep track of the selected group
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')

  // If the selected group is not in the list of groups, default to the first group (if available)
  // TODO: Really? Wierd? No?
  const effectiveGroupId = groups.some((group) => group.id === selectedGroupId)
    ? selectedGroupId
    : (groups[0]?.id ?? '')
  const selectedGroup = groups.find((group) => group.id === effectiveGroupId) ?? null

  const positionsQuery = useQuery({
    ...getGroupPositionsOptions({ path: { id: effectiveGroupId } }),
    // Only refetch positions if a group is selected
    enabled: Boolean(effectiveGroupId),
  })

  const invalidatePositions = () =>
    effectiveGroupId
      ? queryClient.invalidateQueries({ queryKey: getGroupPositionsQueryKey({ path: { id: effectiveGroupId } }) })
      : Promise.resolve()

  return (
    <div className="space-y-6">
      <ControlledFieldSelect
        id="positions-group"
        className="max-w-sm"
        label="Group"
        sections={groupSections}
        getValue={(group) => group.id}
        getLabel={(group) => group.name}
        placeholder="Select group"
        value={effectiveGroupId}
        onValueChange={setSelectedGroupId}
      />
      <div className="grid gap-6">
        <PositionsTable
          group={selectedGroup}
          positions={positionsQuery.data ?? []}
          people={peopleQuery.data?.people ?? []}
          isPending={positionsQuery.isPending && Boolean(effectiveGroupId)}
          error={positionsQuery.error}
          onChanged={invalidatePositions}
        />
      </div>
    </div>
  )
}

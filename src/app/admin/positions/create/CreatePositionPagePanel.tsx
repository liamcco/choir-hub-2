'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import {
  getGroupPositionsQueryKey,
  getGroupsOptions,
  getPeopleOptions,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { groupSectionsByKind } from '@/common/groups/utils'
import { ControlledFieldSelect } from '@/components/forms/controlled-field-select'

import { CreatePositionCard } from './CreatePositionCard'

export function CreatePositionPagePanel() {
  const queryClient = useQueryClient()
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const groupsQuery = useQuery(getGroupsOptions())
  const peopleQuery = useQuery(getPeopleOptions())
  const groups = groupsQuery.data ?? []
  const groupSections = groupSectionsByKind(groups)
  const effectiveGroupId = groups.some((group) => group.id === selectedGroupId)
    ? selectedGroupId
    : (groups[0]?.id ?? '')
  const selectedGroup = groups.find((group) => group.id === effectiveGroupId) ?? null
  const invalidatePositions = () =>
    effectiveGroupId
      ? queryClient.invalidateQueries({ queryKey: getGroupPositionsQueryKey({ path: { id: effectiveGroupId } }) })
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
        people={peopleQuery.data?.people ?? []}
        onChanged={invalidatePositions}
      />
    </div>
  )
}

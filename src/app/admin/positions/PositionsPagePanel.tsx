'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getDirectGroupMembershipsOptions,
  getGroupPositionsOptions,
  getGroupPositionsQueryKey,
  getGroupsOptions,
  getPeopleOptions,
} from '@/lib/api-client/@tanstack/react-query.gen'

import { selectClassName } from '@/common/ui/form'
import { Field, FieldLabel } from '@/components/ui/field'

import { PositionsAdmin } from './PositionsAdmin'

export function PositionsPagePanel() {
  const queryClient = useQueryClient()
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const groupsQuery = useQuery(getGroupsOptions())
  const peopleQuery = useQuery(getPeopleOptions())
  const groups = groupsQuery.data?.groups ?? []
  const effectiveGroupId = groups.some((group) => group.id === selectedGroupId) ? selectedGroupId : (groups[0]?.id ?? '')
  const membershipsQuery = useQuery({
    ...getDirectGroupMembershipsOptions({ path: { id: effectiveGroupId } }),
    enabled: Boolean(effectiveGroupId),
  })
  const positionsQuery = useQuery({
    ...getGroupPositionsOptions({ path: { id: effectiveGroupId } }),
    enabled: Boolean(effectiveGroupId),
  })
  const selectedGroup = groups.find((group) => group.id === effectiveGroupId) ?? null
  const invalidatePositions = () =>
    effectiveGroupId
      ? queryClient.invalidateQueries({ queryKey: getGroupPositionsQueryKey({ path: { id: effectiveGroupId } }) })
      : Promise.resolve()

  return (
    <div className="space-y-6">
      <Field className="max-w-sm">
        <FieldLabel htmlFor="positions-group">Group</FieldLabel>
        <select
          id="positions-group"
          className={selectClassName}
          value={effectiveGroupId}
          onChange={(event) => setSelectedGroupId(event.target.value)}
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </Field>
      <PositionsAdmin
        group={selectedGroup}
        positions={positionsQuery.data?.positions ?? []}
        memberships={membershipsQuery.data?.memberships ?? []}
        people={peopleQuery.data?.people ?? []}
        isPending={Boolean(effectiveGroupId) && positionsQuery.isPending}
        error={positionsQuery.error}
        onPositionsChanged={invalidatePositions}
      />
    </div>
  )
}

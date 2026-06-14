'use client'

import { useMemo, useState } from 'react'

import type { Group } from '@/common/groups/types'
import { groupSectionsByKind } from '@/common/groups/utils'

export function useGroupSelection(groups: Group[]) {
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const effectiveGroupId = groups.some((group) => group.id === selectedGroupId)
    ? selectedGroupId
    : (groups[0]?.id ?? '')

  return {
    effectiveGroupId,
    groupSections: useMemo(() => groupSectionsByKind(groups), [groups]),
    selectedGroup: groups.find((group) => group.id === effectiveGroupId) ?? null,
    selectedGroupId,
    setSelectedGroupId,
  }
}

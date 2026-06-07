import type { Group, Position, User } from './types'

export const rootParentKey = '__root__'

export function userLabel(user: User | undefined, withEmail = false) {
  if (!user) {
    return 'Missing user'
  }

  if (withEmail) {
    return `${user.name} <${user.email}>`
  }

  return user.name
}

export function formatDate(value: string | null) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export function groupSectionsByKind(groups: Group[]) {
  const sectionsByKind = new Map<string, Group[]>()

  for (const group of groups) {
    const kindName = group.kindName ?? 'Unknown kind'
    sectionsByKind.set(kindName, [...(sectionsByKind.get(kindName) ?? []), group])
  }

  return [...sectionsByKind.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([kindName, kindGroups]) => ({
      key: kindName,
      label: kindName,
      items: kindGroups.toSorted((a, b) => a.name.localeCompare(b.name)),
    }))
}

export function groupByParentId<TGroup extends { id: string; parentGroupId: string | null }>(
  groups: TGroup[],
  fallbackParentKey = rootParentKey,
) {
  const groupsByParentId = new Map<string, TGroup[]>()

  for (const group of groups) {
    const parentKey = group.parentGroupId ?? fallbackParentKey
    groupsByParentId.set(parentKey, [...(groupsByParentId.get(parentKey) ?? []), group])
  }

  return groupsByParentId
}

export function groupPositionsByGroupId<TPosition extends Pick<Position, 'groupIds'>>(positions: TPosition[]) {
  const positionsByGroupId = new Map<string, TPosition[]>()

  for (const position of positions) {
    for (const groupId of position.groupIds) {
      positionsByGroupId.set(groupId, [...(positionsByGroupId.get(groupId) ?? []), position])
    }
  }

  return positionsByGroupId
}

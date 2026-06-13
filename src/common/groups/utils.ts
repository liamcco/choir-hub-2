import type { Group, User } from './types'

export function userLabel(user: User | undefined) {
  if (!user) {
    return 'Missing user'
  }

  return `${user.name} <${user.email}>`
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

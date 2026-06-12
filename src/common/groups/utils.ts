import type { Person } from './types'
import type { Group } from './types'

export function personLabel(person: Person | undefined) {
  if (!person) {
    return 'Missing person'
  }

  return person.user ? `${person.user.name} <${person.user.email}>` : person.id
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
    const kindName = group.kind?.name ?? 'Unknown kind'
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

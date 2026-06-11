import type { Person } from './types'

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

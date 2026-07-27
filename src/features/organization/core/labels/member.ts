import type { User } from '@/drizzle/schema'

export type UserLabel = { user: User; label: string; detail: string }

export function buildUserLabels(users: readonly User[]): UserLabel[] {
  return users.map((user) => ({
    user,
    label: user.name || formatUserFallbackLabel(user),
    detail: user.email || user.id,
  }))
}

export function buildUserLabelMap(users: readonly User[]): ReadonlyMap<string, UserLabel> {
  return new Map(buildUserLabels(users).map((option) => [option.user.id, option]))
}

export function formatUserFallbackLabel(user: User) {
  return `User ${user.id}`
}

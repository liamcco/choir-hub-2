import type { User } from '@/drizzle/schema'

export type UserLabel = { user: User; label: string; detail: string }

export function buildUserLabels(users: User[]): UserLabel[] {
  return users.map((user) => ({
    user,
    label: user.name || formatUserFallbackLabel(user),
    detail: user.email || user.id,
  }))
}

export function formatUserFallbackLabel(user: User) {
  return `User ${user.id}`
}

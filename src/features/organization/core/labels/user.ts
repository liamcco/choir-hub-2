import type { User } from '@/drizzle/schema'

export type UserDisplayOption = { user: User; label: string; detail: string }

export function buildUserDisplayOptions(users: readonly User[]): UserDisplayOption[] {
  return users.map((user) => ({
    user,
    label: user.name || formatUserFallbackLabel(user),
    detail: user.email || user.id,
  }))
}

export function buildUserDisplayOptionMap(users: readonly User[]): ReadonlyMap<string, UserDisplayOption> {
  return new Map(buildUserDisplayOptions(users).map((option) => [option.user.id, option]))
}

export function formatUserFallbackLabel(user: User) {
  return `User ${user.id}`
}

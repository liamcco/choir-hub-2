import { db } from '@/core/db'
import { groupMembership, positionAssignment, positionScope } from '@/drizzle/schema'
import { isCurrentDatedPeriod } from './dated-history'

export type EffectiveMembershipSource = { type: 'explicit' | 'position'; id: string; positionId?: string }
export type EffectiveGroupMembership = {
  userId: string
  groupId: string
  startsAt: Date
  endsAt: Date | null
  sources: EffectiveMembershipSource[]
}

export function mergeEffectiveGroupMemberships(rows: EffectiveGroupMembership[]) {
  const merged = new Map<string, EffectiveGroupMembership>()
  for (const row of rows) {
    const key = `${row.userId}:${row.groupId}:${row.startsAt.toISOString()}:${row.endsAt?.toISOString() ?? ''}`
    const existing = merged.get(key)
    if (existing) existing.sources.push(...row.sources)
    else merged.set(key, { ...row, sources: [...row.sources] })
  }
  return [...merged.values()].sort(
    (a, b) =>
      a.groupId.localeCompare(b.groupId) ||
      a.userId.localeCompare(b.userId) ||
      a.startsAt.getTime() - b.startsAt.getTime(),
  )
}

export const effectiveGroupMembership = {
  async list(input: { at?: Date; groupId?: string; userId?: string } = {}): Promise<EffectiveGroupMembership[]> {
    const at = input.at
    const [explicit, assignments, scopes] = await Promise.all([
      db.select().from(groupMembership),
      db.select().from(positionAssignment),
      db.select().from(positionScope),
    ])
    const positionGroups = new Map<string, string[]>()
    for (const scope of scopes)
      if (scope.targetType === 'group' && scope.groupId)
        positionGroups.set(scope.positionId, [...(positionGroups.get(scope.positionId) ?? []), scope.groupId])
    const rows: EffectiveGroupMembership[] = []
    for (const m of explicit)
      rows.push({
        userId: m.userId,
        groupId: m.groupId,
        startsAt: m.startsAt,
        endsAt: m.endsAt,
        sources: [{ type: 'explicit', id: m.id }],
      })
    for (const a of assignments)
      for (const groupId of positionGroups.get(a.positionId) ?? [])
        rows.push({
          userId: a.userId,
          groupId,
          startsAt: a.startsAt,
          endsAt: a.endsAt,
          sources: [{ type: 'position', id: a.id, positionId: a.positionId }],
        })
    const filtered = rows.filter(
      (r) =>
        (!input.groupId || r.groupId === input.groupId) &&
        (!input.userId || r.userId === input.userId) &&
        (!at || isCurrentDatedPeriod(r, at)),
    )
    return mergeEffectiveGroupMemberships(filtered)
  },
  async isMember(input: { userId: string; groupId: string; at?: Date }) {
    return (await this.list(input)).length > 0
  },
}

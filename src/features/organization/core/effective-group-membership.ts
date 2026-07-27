import { and, eq, isNotNull, isNull } from 'drizzle-orm'
import { db } from '@/core/db'
import { TopologyScopeType, topology } from '@/core/topology'
import { groupMembership, positionAssignment } from '@/drizzle/schema'

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
  async list(input: { groupId?: string; userId?: string } = {}): Promise<EffectiveGroupMembership[]> {
    const [explicit, assignments] = await Promise.all([
      db
        .select()
        .from(groupMembership)
        .where(
          and(input.groupId ? eq(groupMembership.groupId, input.groupId) : undefined, isNull(groupMembership.endsAt)),
        ),
      db.select().from(positionAssignment).where(isNull(positionAssignment.endsAt)),
    ])
    return buildEffectiveMemberships(explicit, assignments, input)
  },
  async listPrevious(input: { groupId?: string; userId?: string } = {}): Promise<EffectiveGroupMembership[]> {
    const [explicit, assignments] = await Promise.all([
      db
        .select()
        .from(groupMembership)
        .where(
          and(
            input.groupId ? eq(groupMembership.groupId, input.groupId) : undefined,
            isNotNull(groupMembership.endsAt),
          ),
        ),
      db.select().from(positionAssignment).where(isNotNull(positionAssignment.endsAt)),
    ])
    return buildEffectiveMemberships(explicit, assignments, input)
  },
  async isMember(input: { userId: string; groupId: string }) {
    return (await this.list(input)).length > 0
  },
}

function buildEffectiveMemberships(
  explicit: Array<typeof groupMembership.$inferSelect>,
  assignments: Array<typeof positionAssignment.$inferSelect>,
  input: { groupId?: string; userId?: string },
) {
  const rows: EffectiveGroupMembership[] = []
  for (const m of explicit)
    rows.push({
      userId: m.userId,
      groupId: m.groupId,
      startsAt: m.startsAt,
      endsAt: m.endsAt,
      sources: [{ type: 'explicit', id: m.id }],
    })
  for (const a of assignments) {
    const position = topology.positions.find((candidate) => candidate.id === a.positionId)
    for (const scope of position?.scopes.filter((candidate) => candidate.type === TopologyScopeType.GROUP) ?? [])
      rows.push({
        userId: a.userId,
        groupId: scope.groupId,
        startsAt: a.startsAt,
        endsAt: a.endsAt,
        sources: [{ type: 'position', id: a.id, positionId: a.positionId }],
      })
  }
  return mergeEffectiveGroupMemberships(
    rows.filter((r) => (!input.groupId || r.groupId === input.groupId) && (!input.userId || r.userId === input.userId)),
  )
}

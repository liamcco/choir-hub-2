import { and, eq, inArray, isNotNull, isNull } from 'drizzle-orm'
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

type EffectiveMembershipListInput = { groupId?: string; userId?: string }
type RelationshipState = 'current' | 'previous'

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
  async list(input: EffectiveMembershipListInput = {}): Promise<EffectiveGroupMembership[]> {
    const [explicit, assignments] = await Promise.all([
      listExplicitMemberships(input, 'current'),
      listPositionAssignments(input, 'current'),
    ])
    return buildEffectiveMemberships(explicit, assignments, input)
  },
  async listPrevious(input: EffectiveMembershipListInput = {}): Promise<EffectiveGroupMembership[]> {
    const [explicit, assignments] = await Promise.all([
      listExplicitMemberships(input, 'previous'),
      listPositionAssignments(input, 'previous'),
    ])
    return buildEffectiveMemberships(explicit, assignments, input)
  },
  async isMember(input: { userId: string; groupId: string }): Promise<boolean> {
    const positionIds = groupScopedPositionIds(input.groupId)
    const [explicit, assignments] = await Promise.all([
      db
        .select({ id: groupMembership.id })
        .from(groupMembership)
        .where(
          and(
            eq(groupMembership.userId, input.userId),
            eq(groupMembership.groupId, input.groupId),
            isNull(groupMembership.endsAt),
          ),
        )
        .limit(1),
      positionIds.length
        ? db
            .select({ id: positionAssignment.id })
            .from(positionAssignment)
            .where(
              and(
                eq(positionAssignment.userId, input.userId),
                inArray(positionAssignment.positionId, positionIds),
                isNull(positionAssignment.endsAt),
              ),
            )
            .limit(1)
        : Promise.resolve([]),
    ])
    return explicit.length > 0 || assignments.length > 0
  },
}

function listExplicitMemberships(input: EffectiveMembershipListInput, state: RelationshipState) {
  return db
    .select()
    .from(groupMembership)
    .where(
      and(
        input.userId ? eq(groupMembership.userId, input.userId) : undefined,
        input.groupId ? eq(groupMembership.groupId, input.groupId) : undefined,
        state === 'current' ? isNull(groupMembership.endsAt) : isNotNull(groupMembership.endsAt),
      ),
    )
}

function listPositionAssignments(input: EffectiveMembershipListInput, state: RelationshipState) {
  const positionIds = groupScopedPositionIds(input.groupId)
  if (!positionIds.length) return Promise.resolve([] as Array<typeof positionAssignment.$inferSelect>)

  return db
    .select()
    .from(positionAssignment)
    .where(
      and(
        input.userId ? eq(positionAssignment.userId, input.userId) : undefined,
        inArray(positionAssignment.positionId, positionIds),
        state === 'current' ? isNull(positionAssignment.endsAt) : isNotNull(positionAssignment.endsAt),
      ),
    )
}

function groupScopedPositionIds(groupId?: string) {
  return topology.positions
    .filter((position) =>
      position.scopes.some(
        (scope) => scope.type === TopologyScopeType.GROUP && (!groupId || scope.groupId === groupId),
      ),
    )
    .map((position) => position.id)
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

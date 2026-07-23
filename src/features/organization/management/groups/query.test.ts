import { describe, expect, mock, test } from 'bun:test'
import { type Group, GroupKind, type GroupMembership, MemberStatus, type User } from '@/prisma/generated/client'

mock.module('server-only', () => ({}))
mock.module('@/features/organization', () => ({ organizationService: {} }))

const { buildGroupHierarchy } = await import('./query')

const at = new Date('2026-07-22T12:00:00.000Z')

describe('Group hierarchy read', () => {
  test('uses stable tree order and depth while deduplicating current subtree Members by status', () => {
    const result = buildGroupHierarchy(
      [
        group('sopranos', 'Sopranos', 'choir'),
        group('choir', 'Choir'),
        group('alto-1', 'First Altos', 'altos'),
        group('altos', 'Altos', 'choir'),
        group('board', 'Board'),
      ],
      [member('ada', MemberStatus.ACTIVE), member('pat', MemberStatus.PASSIVE), member('fran', MemberStatus.FORMER)],
      [
        membership('ada-choir', 'ada', 'choir'),
        membership('ada-altos', 'ada', 'altos'),
        membership('pat-alto', 'pat', 'alto-1'),
        membership('fran-sopranos', 'fran', 'sopranos'),
        membership('ended-board', 'ada', 'board', new Date('2026-01-01T00:00:00.000Z')),
      ],
      at,
    )

    expect(result.map(({ id, depth }) => ({ id, depth }))).toEqual([
      { id: 'board', depth: 0 },
      { id: 'choir', depth: 0 },
      { id: 'altos', depth: 1 },
      { id: 'alto-1', depth: 2 },
      { id: 'sopranos', depth: 1 },
    ])
    expect(countsFor(result, 'choir')).toEqual({ ACTIVE: 1, PASSIVE: 1, FORMER: 1 })
    expect(countsFor(result, 'altos')).toEqual({ ACTIVE: 1, PASSIVE: 1, FORMER: 0 })
    expect(countsFor(result, 'board')).toEqual({ ACTIVE: 0, PASSIVE: 0, FORMER: 0 })
  })

  test('does not count scheduled or ended memberships as current', () => {
    const result = buildGroupHierarchy(
      [group('choir', 'Choir')],
      [member('active', MemberStatus.ACTIVE), member('passive', MemberStatus.PASSIVE)],
      [
        membership('scheduled', 'active', 'choir', null, new Date('2026-08-01T00:00:00.000Z')),
        membership('ended', 'passive', 'choir', new Date('2026-07-22T00:00:00.000Z')),
      ],
      at,
    )

    expect(countsFor(result, 'choir')).toEqual({ ACTIVE: 0, PASSIVE: 0, FORMER: 0 })
  })
})

function countsFor(result: ReturnType<typeof buildGroupHierarchy>, groupId: string) {
  return result.find((row) => row.id === groupId)?.memberCounts
}

function group(id: string, name: string, parentGroupId: string | null = null): Group {
  return { id, name, parentGroupId, kind: GroupKind.SECTION, description: null, createdAt: at, updatedAt: at }
}

function member(id: string, status: MemberStatus): User {
  return {
    id,
    name: id,
    email: `${id}@example.invalid`,
    emailVerified: false,
    status,
    createdAt: at,
    updatedAt: at,
  } as User
}

function membership(
  id: string,
  userId: string,
  groupId: string,
  endsAt: Date | null = null,
  startsAt = new Date('2026-01-01T00:00:00.000Z'),
): GroupMembership {
  return { id, userId, groupId, startsAt, endsAt }
}

import { describe, expect, test } from 'bun:test'
import { mergeEffectiveGroupMemberships } from './effective-group-membership'

describe('effective group membership', () => {
  test('deduplicates explicit and position-derived sources without losing provenance', () => {
    const startsAt = new Date('2026-01-01')
    const result = mergeEffectiveGroupMemberships([
      { userId: 'u1', groupId: 'board', startsAt, endsAt: null, sources: [{ type: 'explicit', id: 'm1' }] },
      {
        userId: 'u1',
        groupId: 'board',
        startsAt,
        endsAt: null,
        sources: [{ type: 'position', id: 'a1', positionId: 'p1' }],
      },
    ])
    expect(result).toHaveLength(1)
    expect(result[0]?.sources).toHaveLength(2)
  })
})

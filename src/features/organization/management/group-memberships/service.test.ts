import { describe, expect, test } from 'bun:test'
import { categorizeGroupMembershipPeriods } from './periods'

describe('Group Membership period categorization', () => {
  test('keeps current, scheduled, and historical periods separate', () => {
    const at = new Date('2026-01-01T00:00:00Z')
    const base = {
      groupId: 'board',
      userId: 'user',
      group: { id: 'board' } as never,
      user: {} as never,
      userLabel: 'User',
      userDetail: '',
    }
    const result = categorizeGroupMembershipPeriods(
      [
        { ...base, id: 'current', startsAt: new Date('2025-01-01'), endsAt: null },
        { ...base, id: 'scheduled', startsAt: new Date('2027-01-01'), endsAt: null },
        { ...base, id: 'historical', startsAt: new Date('2024-01-01'), endsAt: new Date('2025-01-01') },
      ],
      at,
    )
    expect(result.currentMemberships.map(({ id }) => id)).toEqual(['current'])
    expect(result.scheduledMemberships.map(({ id }) => id)).toEqual(['scheduled'])
    expect(result.historicalMemberships.map(({ id }) => id)).toEqual(['historical'])
  })
})

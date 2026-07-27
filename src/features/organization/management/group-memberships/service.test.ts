import { describe, expect, test } from 'bun:test'
import { splitGroupMembershipPeriods } from './periods'

describe('Group Membership period categorization', () => {
  test('keeps active and historical periods separate', () => {
    const base = {
      groupId: 'board',
      userId: 'user',
      group: { id: 'board' } as never,
      user: {} as never,
      userLabel: 'User',
      userDetail: '',
    }
    const result = splitGroupMembershipPeriods(
      [{ ...base, id: 'current', startsAt: new Date('2025-01-01'), endsAt: null }],
      [{ ...base, id: 'historical', startsAt: new Date('2024-01-01'), endsAt: new Date('2025-01-01') }],
    )
    expect(result.currentMemberships.map(({ id }) => id)).toEqual(['current'])
    expect(result.historicalMemberships.map(({ id }) => id)).toEqual(['historical'])
  })
})

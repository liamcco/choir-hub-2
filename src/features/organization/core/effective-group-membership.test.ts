import { beforeEach, describe, expect, mock, test } from 'bun:test'

const selectResults: unknown[][] = []
const limitCalls: unknown[][] = []

function query(rows: unknown[]) {
  return Object.assign(Promise.resolve(rows), {
    limit: mock(async () => {
      limitCalls.push(rows)
      return rows
    }),
  })
}

const where = mock(() => query(selectResults.shift() ?? []))
const from = mock(() => ({ where }))
const select = mock(() => ({ from }))

mock.module('@/core/db', () => ({ db: { select } }))
mock.module('server-only', () => ({}))

const { effectiveGroupMembership, mergeEffectiveGroupMemberships } = await import('./effective-group-membership')

beforeEach(() => {
  selectResults.length = 0
  limitCalls.length = 0
  select.mockClear()
  from.mockClear()
  where.mockClear()
})

describe('effective group membership', () => {
  test('deduplicates identical intervals without losing provenance', () => {
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
    expect(result[0]?.sources).toEqual([
      { type: 'explicit', id: 'm1' },
      { type: 'position', id: 'a1', positionId: 'p1' },
    ])
  })

  test('preserves overlapping intervals with different boundaries', () => {
    const result = mergeEffectiveGroupMemberships([
      {
        userId: 'u1',
        groupId: 'board',
        startsAt: new Date('2026-01-01'),
        endsAt: new Date('2026-06-01'),
        sources: [{ type: 'explicit', id: 'm1' }],
      },
      {
        userId: 'u1',
        groupId: 'board',
        startsAt: new Date('2026-03-01'),
        endsAt: new Date('2026-12-01'),
        sources: [{ type: 'position', id: 'a1', positionId: 'p1' }],
      },
    ])

    expect(result).toHaveLength(2)
    expect(result.map(({ startsAt, endsAt }) => [startsAt.toISOString(), endsAt?.toISOString()])).toEqual([
      ['2026-01-01T00:00:00.000Z', '2026-06-01T00:00:00.000Z'],
      ['2026-03-01T00:00:00.000Z', '2026-12-01T00:00:00.000Z'],
    ])
  })

  test('preserves adjacent intervals as separate dated records', () => {
    const result = mergeEffectiveGroupMemberships([
      {
        userId: 'u1',
        groupId: 'board',
        startsAt: new Date('2026-01-01'),
        endsAt: new Date('2026-03-01'),
        sources: [{ type: 'explicit', id: 'm1' }],
      },
      {
        userId: 'u1',
        groupId: 'board',
        startsAt: new Date('2026-03-01'),
        endsAt: new Date('2026-06-01'),
        sources: [{ type: 'position', id: 'a1', positionId: 'p1' }],
      },
    ])

    expect(result).toHaveLength(2)
  })

  test('filters source reads by user and preserves current membership results', async () => {
    selectResults.push(
      [
        {
          id: 'm1',
          userId: 'u1',
          groupId: 'board',
          startsAt: new Date('2026-01-01'),
          endsAt: null,
        },
        {
          id: 'm2',
          userId: 'u2',
          groupId: 'board',
          startsAt: new Date('2026-01-01'),
          endsAt: null,
        },
      ],
      [],
    )

    await expect(effectiveGroupMembership.list({ groupId: 'board', userId: 'u1' })).resolves.toEqual([
      {
        userId: 'u1',
        groupId: 'board',
        startsAt: new Date('2026-01-01'),
        endsAt: null,
        sources: [{ type: 'explicit', id: 'm1' }],
      },
    ])
    expect(select).toHaveBeenCalledTimes(2)
  })

  test('checks current membership with narrow existence queries', async () => {
    selectResults.push([{ id: 'm1' }], [])

    await expect(effectiveGroupMembership.isMember({ userId: 'u1', groupId: 'board' })).resolves.toBe(true)
    expect(limitCalls).toHaveLength(2)
  })

  test('returns false without querying assignments for a group with no position scope', async () => {
    selectResults.push([])

    await expect(effectiveGroupMembership.isMember({ userId: 'u1', groupId: 'not-a-group' })).resolves.toBe(false)
    expect(limitCalls).toHaveLength(1)
  })
})

import { describe, expect, test } from 'bun:test'
import { filterPlacementUsers, placementCounts, sortPlacementUsers, visiblePlacementUsers } from './model'
import type { PlacementUser } from './query'

const users: PlacementUser[] = [
  {
    id: 'active-kk',
    name: 'Active KK',
    email: 'a@example.com',
    status: 'ACTIVE',
    choirId: 'kk',
    sectionId: 'kk-b',
    voice: 'B1',
  },
  {
    id: 'passive-kk',
    name: 'Passive KK',
    email: 'p@example.com',
    status: 'PASSIVE',
    choirId: 'kk',
    sectionId: 'kk-b',
    voice: 'B2',
  },
  {
    id: 'former-kk',
    name: 'Former KK',
    email: 'f@example.com',
    status: 'FORMER',
    choirId: 'kk',
    sectionId: 'kk-b',
    voice: 'B1',
  },
  {
    id: 'no-section',
    name: 'No Section',
    email: 'n@example.com',
    status: 'ACTIVE',
    choirId: 'mk',
    sectionId: null,
    voice: null,
  },
  {
    id: 'no-choir',
    name: 'No Choir',
    email: 'c@example.com',
    status: 'FORMER',
    choirId: null,
    sectionId: null,
    voice: null,
  },
]

describe('Placement roster model', () => {
  test('filters OTHERS into no-section and no-choir categories', () => {
    expect(filterPlacementUsers(users, 'others-no-section').map((user) => user.id)).toEqual(['no-section'])
    expect(filterPlacementUsers(users, 'others-no-choir').map((user) => user.id)).toEqual(['no-choir'])
  })

  test('counts active Choir and Section members but all statuses in OTHERS', () => {
    const counts = placementCounts(users)
    expect(counts.get('kk')).toBe(1)
    expect(counts.get('kk-b')).toBe(1)
    expect(counts.get('others')).toBe(1)
    expect(counts.get('others-no-choir')).toBe(0)
  })

  test('hides former members and sorts active voices before passive voices', () => {
    expect(visiblePlacementUsers(users).map((user) => user.id)).toEqual(['active-kk', 'passive-kk', 'no-section'])
    expect(sortPlacementUsers(visiblePlacementUsers(users)).map((user) => user.id)).toEqual([
      'active-kk',
      'no-section',
      'passive-kk',
    ])
  })
})

import { describe, expect, test } from 'bun:test'
import { getPositionCollectionGroup } from './position-collection-group'

const groups = [
  { id: 'board', kind: 'board', name: 'Board', scope: { type: 'csk' }, status: 'active' },
  { id: 'utantill-committee', kind: 'committee', name: 'Utantill Committee', scope: { type: 'csk' }, status: 'active' },
] as const

describe('position collection grouping', () => {
  test('puts only Board-scoped positions in the Board group', () => {
    expect(getPositionCollectionGroup([{ type: 'group', groupId: 'board' }], groups, [], [])).toBe('Board')

    expect(getPositionCollectionGroup([{ type: 'csk' }], groups, [], [])).toBe('Other')

    expect(getPositionCollectionGroup([{ type: 'group', groupId: 'utantill-committee' }], groups, [], [])).toBe('Other')
  })
})

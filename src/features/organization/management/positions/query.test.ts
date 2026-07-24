import { describe, expect, test } from 'bun:test'
import { getPositionCollectionGroup } from './position-collection-group'

const groups = [
  { id: 'board', kind: 'board' },
  { id: 'utantill-committee', kind: 'committee' },
]

describe('position collection grouping', () => {
  test('puts only Board-scoped positions in the Board group', () => {
    expect(
      getPositionCollectionGroup(
        [{ targetType: 'group', choirId: null, sectionId: null, groupId: 'board' }],
        groups,
        [],
        [],
      ),
    ).toBe('Board')

    expect(
      getPositionCollectionGroup(
        [{ targetType: 'csk', choirId: null, sectionId: null, groupId: null }],
        groups,
        [],
        [],
      ),
    ).toBe('Other')

    expect(
      getPositionCollectionGroup(
        [{ targetType: 'group', choirId: null, sectionId: null, groupId: 'utantill-committee' }],
        groups,
        [],
        [],
      ),
    ).toBe('Other')
  })
})

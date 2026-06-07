import { describe, expect, test } from 'bun:test'

import { getDescendantGroupIdsFromHierarchy, getDirectMemberCounts, getEffectiveMemberCounts } from './hierarchy'

describe('group hierarchy helpers', () => {
  test('returns descendants without including the root group', () => {
    const descendants = getDescendantGroupIdsFromHierarchy('root', [
      { id: 'root', parentGroupId: null },
      { id: 'child-a', parentGroupId: 'root' },
      { id: 'child-b', parentGroupId: 'root' },
      { id: 'grandchild', parentGroupId: 'child-a' },
      { id: 'unrelated', parentGroupId: null },
    ])

    expect(descendants).toEqual(['child-a', 'child-b', 'grandchild'])
  })

  test('stops traversal when hierarchy data contains a cycle', () => {
    const descendants = getDescendantGroupIdsFromHierarchy('a', [
      { id: 'a', parentGroupId: 'b' },
      { id: 'b', parentGroupId: 'a' },
    ])

    expect(descendants).toEqual(['b'])
  })

  test('counts effective members through ancestors and de-duplicates users', () => {
    const counts = getEffectiveMemberCounts(
      [
        { id: 'root', parentGroupId: null },
        { id: 'section', parentGroupId: 'root' },
        { id: 'voice', parentGroupId: 'section' },
      ],
      [
        { groupId: 'root', userId: 'root-member' },
        { groupId: 'section', userId: 'section-member' },
        { groupId: 'voice', userId: 'voice-member' },
        { groupId: 'voice', userId: 'section-member' },
      ],
    )

    expect(counts.get('voice')).toBe(2)
    expect(counts.get('section')).toBe(2)
    expect(counts.get('root')).toBe(3)
  })

  test('counts direct members and de-duplicates users within each group', () => {
    const counts = getDirectMemberCounts([
      { groupId: 'root', userId: 'root-member' },
      { groupId: 'section', userId: 'section-member' },
      { groupId: 'section', userId: 'section-member' },
    ])

    expect(counts.get('root')).toBe(1)
    expect(counts.get('section')).toBe(1)
  })
})

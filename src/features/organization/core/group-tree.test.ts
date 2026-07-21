import { describe, expect, test } from 'bun:test'
import { type Group, GroupKind } from '@/prisma/generated/client'
import {
  buildGroupPathLabels,
  buildGroupTree,
  compareGroupTreeSiblings,
  formatGroupPath,
  groupSiblingNamesMatch,
  isGroupAncestor,
} from './group-tree'

describe('Group tree', () => {
  test('builds a sorted hierarchy with stable depth values', () => {
    const tree = buildGroupTree([
      group({ id: 'tenors', name: 'Tenors', parentGroupId: 'choir' }),
      group({ id: 'choir', name: 'CSK' }),
      group({ id: 'altos', name: 'Altos', parentGroupId: 'choir' }),
      group({ id: 'board', name: 'Board' }),
    ])

    expect(flattenTree(tree)).toEqual([
      { id: 'board', depth: 0 },
      { id: 'choir', depth: 0 },
      { id: 'altos', depth: 1 },
      { id: 'tenors', depth: 1 },
    ])
  })

  test('keeps orphaned parent references as roots', () => {
    const tree = buildGroupTree([group({ id: 'altos', name: 'Altos', parentGroupId: 'missing' })])

    expect(flattenTree(tree)).toEqual([{ id: 'altos', depth: 0 }])
  })

  test('protects tree building and path labels from cycles', () => {
    const groups = [
      group({ id: 'a', name: 'A', parentGroupId: 'b' }),
      group({ id: 'b', name: 'B', parentGroupId: 'a' }),
      group({ id: 'self', name: 'Self', parentGroupId: 'self' }),
    ]

    expect(flattenTree(buildGroupTree(groups))).toEqual([
      { id: 'a', depth: 0 },
      { id: 'b', depth: 0 },
      { id: 'self', depth: 0 },
    ])
    expect(formatGroupPath(groups, groups[0])).toBe('B / A')
    expect(formatGroupPath(groups, groups[1])).toBe('A / B')
    expect(formatGroupPath(groups, groups[2])).toBe('Self')
  })

  test('builds path labels once for lookup by Group id', () => {
    const groups = [group({ id: 'choir', name: 'CSK' }), group({ id: 'altos', name: 'Altos', parentGroupId: 'choir' })]

    expect(buildGroupPathLabels(groups)).toEqual(
      new Map([
        ['choir', 'CSK'],
        ['altos', 'CSK / Altos'],
      ]),
    )
  })

  test('checks ancestors with missing parents and cycle protection', () => {
    const groups = [
      group({ id: 'choir', name: 'CSK' }),
      group({ id: 'altos', name: 'Altos', parentGroupId: 'choir' }),
      group({ id: 'a', name: 'A', parentGroupId: 'b' }),
      group({ id: 'b', name: 'B', parentGroupId: 'a' }),
    ]

    expect(isGroupAncestor(groups, { groupId: 'altos', ancestorGroupId: 'choir' })).toBe(true)
    expect(isGroupAncestor(groups, { groupId: 'choir', ancestorGroupId: 'altos' })).toBe(false)
    expect(isGroupAncestor(groups, { groupId: 'missing', ancestorGroupId: 'choir' })).toBe(false)
    expect(isGroupAncestor(groups, { groupId: 'a', ancestorGroupId: 'a' })).toBe(false)
  })

  test('compares sibling names with admin validation normalization', () => {
    expect(groupSiblingNamesMatch(' Altos ', 'altos')).toBe(true)
    expect(groupSiblingNamesMatch('Altos', 'Tenors')).toBe(false)
  })

  test('sorts siblings by display name and then id', () => {
    expect(
      [group({ id: 'b', name: 'Altos' }), group({ id: 'a', name: 'Altos' })].sort(compareGroupTreeSiblings),
    ).toEqual([group({ id: 'a', name: 'Altos' }), group({ id: 'b', name: 'Altos' })])
  })
})

function flattenTree(nodes: ReturnType<typeof buildGroupTree>) {
  return nodes.flatMap((node): { id: string; depth: number }[] => [
    { id: node.group.id, depth: node.depth },
    ...flattenTree(node.children),
  ])
}

function group(input: { id: string; name: string; parentGroupId?: string | null }): Group {
  return {
    id: input.id,
    name: input.name,
    parentGroupId: input.parentGroupId ?? null,
    kind: GroupKind.SECTION,
    description: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }
}

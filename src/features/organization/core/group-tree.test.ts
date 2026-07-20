import { describe, expect, test } from 'bun:test'
import {
  buildGroupHierarchy,
  buildGroupPathLookup,
  compareSiblingGroupNames,
  isGroupAncestor,
} from '@/features/organization/core/group-tree'

type TestGroup = Parameters<typeof buildGroupHierarchy>[0][number]

describe('group tree module', () => {
  test('builds sorted hierarchy and treats orphaned parents as roots', () => {
    const hierarchy = buildGroupHierarchy([
      createGroup({ id: 'group-b', name: 'Beta Choir' }),
      createGroup({ id: 'group-a', name: 'Alpha Choir' }),
      createGroup({ id: 'group-c', name: 'Altos', parentGroupId: 'group-a' }),
      createGroup({ id: 'group-d', name: 'Orphan Group', parentGroupId: 'missing-parent' }),
    ])

    expect(hierarchy.map((node) => node.group.id)).toEqual(['group-a', 'group-b', 'group-d'])
    expect(hierarchy[0]?.children.map((child) => child.group.id)).toEqual(['group-c'])
    expect(hierarchy.map((node) => node.depth)).toEqual([0, 0, 0])
    expect(hierarchy[0]?.children.map((child) => child.depth)).toEqual([1])
  })

  test('protects hierarchy building from cycles', () => {
    const hierarchy = buildGroupHierarchy([
      createGroup({ id: 'group-a', name: 'Cycle A', parentGroupId: 'group-b' }),
      createGroup({ id: 'group-b', name: 'Cycle B', parentGroupId: 'group-a' }),
      createGroup({ id: 'group-c', name: 'Root' }),
    ])

    const ids = collectHierarchyIds(hierarchy)
    expect(ids).toHaveLength(3)
    expect(new Set(ids).size).toBe(3)
  })

  test('builds path lookup labels with orphan and cycle protection', () => {
    const groups = [
      createGroup({ id: 'group-root', name: 'CSK Choir' }),
      createGroup({ id: 'group-alto', name: 'Altos', parentGroupId: 'group-root' }),
      createGroup({ id: 'group-orphan', name: 'Orphan Group', parentGroupId: 'missing-parent' }),
      createGroup({ id: 'group-cycle-a', name: 'Cycle A', parentGroupId: 'group-cycle-b' }),
      createGroup({ id: 'group-cycle-b', name: 'Cycle B', parentGroupId: 'group-cycle-a' }),
    ]

    const paths = buildGroupPathLookup(groups)

    expect(paths.get('group-root')).toBe('CSK Choir')
    expect(paths.get('group-alto')).toBe('CSK Choir / Altos')
    expect(paths.get('group-orphan')).toBe('Orphan Group')
    expect(paths.get('group-cycle-a')).toBe('Cycle B / Cycle A')
    expect(paths.get('group-cycle-b')).toBe('Cycle A / Cycle B')
  })

  test('compares sibling names case-insensitively and trim-insensitively', () => {
    expect(compareSiblingGroupNames(' Altos ', 'altos')).toBe(0)
    expect(compareSiblingGroupNames('Sopranos', 'Tenors')).toBeLessThan(0)
  })

  test('checks ancestor relationships with cycle protection', () => {
    const groups = [
      createGroup({ id: 'group-root', name: 'CSK Choir' }),
      createGroup({ id: 'group-alto', name: 'Altos', parentGroupId: 'group-root' }),
      createGroup({ id: 'group-alto-1', name: 'Alto 1', parentGroupId: 'group-alto' }),
      createGroup({ id: 'group-cycle-a', name: 'Cycle A', parentGroupId: 'group-cycle-b' }),
      createGroup({ id: 'group-cycle-b', name: 'Cycle B', parentGroupId: 'group-cycle-a' }),
    ]

    expect(isGroupAncestor(groups, 'group-root', 'group-alto-1')).toBe(true)
    expect(isGroupAncestor(groups, 'group-alto-1', 'group-root')).toBe(false)
    expect(isGroupAncestor(groups, 'group-cycle-a', 'group-cycle-b')).toBe(true)
    expect(isGroupAncestor(groups, 'group-cycle-b', 'group-cycle-a')).toBe(true)
    expect(isGroupAncestor(groups, 'group-root', 'group-root')).toBe(false)
  })
})

function createGroup(input: { id: string; name: string; parentGroupId?: string | null }): TestGroup {
  return {
    id: input.id,
    name: input.name,
    parentGroupId: input.parentGroupId ?? null,
    kind: 'CHOIR',
    description: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  } as TestGroup
}

function collectHierarchyIds(nodes: ReturnType<typeof buildGroupHierarchy>): string[] {
  return nodes.flatMap((node) => [node.group.id, ...collectHierarchyIds(node.children)])
}

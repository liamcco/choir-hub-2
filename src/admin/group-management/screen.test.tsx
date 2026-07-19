import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { GroupManagementScreen } from '@/admin/group-management/screen'
import type { GroupManagementState } from '@/admin/group-management/service'
import type { OrganizationRecord } from '@/organization'
import { GroupKind } from '@/prisma/generated/client'

describe('admin Group management screen', () => {
  test('renders the admin Group workflow with hierarchy and disambiguated parent choices', () => {
    const choir = group({ id: 'choir-1', kind: GroupKind.CHOIR, name: 'CSK' })
    const externalChoir = group({ id: 'choir-2', kind: GroupKind.CHOIR, name: 'External Choir' })
    const cskAltos = group({
      id: 'section-1',
      kind: GroupKind.SECTION,
      name: 'Altos',
      parentGroupId: choir.id,
    })
    const externalAltos = group({
      id: 'section-2',
      kind: GroupKind.SECTION,
      name: 'Altos',
      parentGroupId: externalChoir.id,
    })
    const state: GroupManagementState = {
      groups: [choir, externalChoir, cskAltos, externalAltos],
      hierarchy: [
        {
          group: choir,
          depth: 0,
          children: [{ group: cskAltos, depth: 1, children: [] }],
        },
        {
          group: externalChoir,
          depth: 0,
          children: [{ group: externalAltos, depth: 1, children: [] }],
        },
      ],
    }

    const markup = renderToStaticMarkup(<GroupManagementScreen state={state} />)

    expect(markup).toContain('Create Group')
    expect(markup).toContain('Edit Groups')
    expect(markup).toContain('Hierarchy')
    expect(markup).toContain('Sibling Group names must be unique')
    expect(markup).toContain('Group Kind')
    expect(markup).toContain('Parent Group')
    expect(markup).toContain('CSK / Altos')
    expect(markup).toContain('External Choir / Altos')
  })
})

function group(
  input: Pick<OrganizationRecord<'group'>, 'id' | 'kind' | 'name'> &
    Partial<Pick<OrganizationRecord<'group'>, 'description' | 'parentGroupId'>>,
): OrganizationRecord<'group'> {
  const now = new Date('2026-01-01T00:00:00.000Z')
  return {
    id: input.id,
    kind: input.kind,
    name: input.name,
    description: input.description ?? null,
    parentGroupId: input.parentGroupId ?? null,
    createdAt: now,
    updatedAt: now,
  }
}

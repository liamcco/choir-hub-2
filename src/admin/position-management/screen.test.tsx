import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { PositionManagementScreen } from '@/admin/position-management/screen'
import type { PositionManagementState } from '@/admin/position-management/service'
import type { OrganizationRecord } from '@/organization'
import { GroupKind } from '@/prisma/generated/client'

describe('admin Position management screen', () => {
  test('renders shared multi-scope Positions separately from duplicate same-named Positions', () => {
    const choir = group({ id: 'choir-1', kind: GroupKind.CHOIR, name: 'CSK' })
    const board = group({ id: 'board-1', kind: GroupKind.BOARD, name: 'Board', parentGroupId: choir.id })
    const concertGroup = group({
      id: 'project-1',
      kind: GroupKind.PROJECT,
      name: 'Concert Group',
      parentGroupId: choir.id,
    })
    const sharedChair = position({ id: 'position-1', name: 'Chair', description: 'Shared leadership' })
    const sectionChair = position({ id: 'position-2', name: 'Chair', description: 'Separate position' })
    const state: PositionManagementState = {
      groups: [choir, board, concertGroup],
      positions: [
        {
          position: sharedChair,
          scopeGroups: [board, concertGroup],
          scopeLabel: 'CSK / Board + CSK / Concert Group',
          scopeKind: 'shared',
          duplicateNameCount: 2,
        },
        {
          position: sectionChair,
          scopeGroups: [choir],
          scopeLabel: 'CSK',
          scopeKind: 'single',
          duplicateNameCount: 2,
        },
      ],
    }

    const markup = renderToStaticMarkup(<PositionManagementScreen state={state} />)

    expect(markup).toContain('Create Position')
    expect(markup).toContain('Edit Positions')
    expect(markup).toContain('Position Scopes')
    expect(markup).toContain('Shared Position')
    expect(markup).toContain('Duplicate display name')
    expect(markup).toContain('Separate same-name Position')
    expect(markup).toContain('CSK / Board + CSK / Concert Group')
    expect(markup).toContain('CSK')
    expect(markup).not.toContain('current holder')
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

function position(
  input: Pick<OrganizationRecord<'position'>, 'id' | 'name'> &
    Partial<Pick<OrganizationRecord<'position'>, 'description'>>,
): OrganizationRecord<'position'> {
  const now = new Date('2026-01-01T00:00:00.000Z')
  return {
    id: input.id,
    name: input.name,
    description: input.description ?? null,
    createdAt: now,
    updatedAt: now,
  }
}

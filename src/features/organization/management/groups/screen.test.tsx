import { beforeEach, describe, expect, test } from 'bun:test'
import { GroupKind } from '@/prisma/generated/client'

const { cleanup, render, screen } = await import('@testing-library/react')
const { GroupCollectionScreen } = await import('./group-collection-screen')

beforeEach(cleanup)

describe('Group management screen', () => {
  test('places create and hierarchy actions in the shared collection header', async () => {
    render(
      <GroupCollectionScreen
        groups={[
          {
            id: 'group-1',
            name: 'Chamber Choir',
            kind: GroupKind.CHOIR,
            parentName: null,
            directMemberCount: 3,
          },
        ]}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Groups' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Create Group' }).getAttribute('href')).toBe('/admin/groups/new')
    expect(screen.getByRole('link', { name: 'View hierarchy' }).getAttribute('href')).toBe('/admin/groups/hierarchy')
    expect(screen.getByRole('link', { name: 'Chamber Choir' })).toBeTruthy()
  })
})

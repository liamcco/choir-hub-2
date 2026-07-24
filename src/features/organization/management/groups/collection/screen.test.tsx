import { beforeEach, describe, expect, test } from 'bun:test'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { GroupKind } from '@/prisma/generated/client'

const { cleanup, render, screen } = await import('@testing-library/react')
const { GroupCollectionScreen } = await import('./group-collection-screen')

beforeEach(cleanup)

describe('Group management screen', () => {
  test('places create and hierarchy actions in the shared collection header', async () => {
    render(
      <AppRouterContext.Provider value={router}>
        <GroupCollectionScreen
          createGroups={[]}
          groups={[
            {
              id: 'group-1',
              name: 'Chamber Choir',
              kind: GroupKind.CHOIR,
              parentName: null,
              directMemberCount: 3,
            },
          ]}
        />
      </AppRouterContext.Provider>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Groups' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Create Group' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'View hierarchy' }).getAttribute('href')).toBe('/admin/groups/hierarchy')
    expect(screen.getByRole('link', { name: 'Chamber Choir' })).toBeTruthy()
  })
})

const router = { back() {}, forward() {}, prefetch: async () => {}, push() {}, refresh() {}, replace() {} } as never

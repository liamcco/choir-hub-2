import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { GroupKind } from '@/prisma/generated/client'
import { GroupDetailDialog } from './group-detail-presentation'
import { GroupHierarchy } from './group-hierarchy'

const { cleanup, render, screen } = await import('@testing-library/react')
const userEvent = (await import('@testing-library/user-event')).default

beforeEach(cleanup)

const replace = mock(() => {})

describe('Group hierarchy', () => {
  test('filters visible counts without hiding zero-count Groups and links selection to Group detail', async () => {
    const user = userEvent.setup()
    render(
      <GroupHierarchy
        groups={[
          {
            id: 'choir',
            name: 'Choir',
            kind: GroupKind.CHOIR,
            depth: 0,
            memberCounts: { ACTIVE: 1, PASSIVE: 1, FORMER: 1 },
          },
          {
            id: 'altos',
            name: 'Altos',
            kind: GroupKind.SECTION,
            depth: 1,
            memberCounts: { ACTIVE: 0, PASSIVE: 0, FORMER: 0 },
          },
        ]}
      />,
    )

    expect(screen.getAllByRole('cell', { name: '2' })).toHaveLength(1)
    expect(screen.getAllByRole('cell', { name: '0' })).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Altos' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Altos' }).getAttribute('href')).toBe('/admin/groups?detail=altos')

    await user.click(screen.getByRole('button', { name: 'Active' }))
    expect(screen.getAllByRole('cell', { name: '1' })).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Altos' })).toBeTruthy()

    await user.click(screen.getByRole('checkbox', { name: 'Include former Members' }))
    expect(screen.getAllByRole('cell', { name: '2' })).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Altos' })).toBeTruthy()
  })

  test('keeps the hierarchy visible while Group detail is overlaid and returns to it when closed', async () => {
    const user = userEvent.setup()
    replace.mockClear()
    render(
      <>
        <main>
          <GroupHierarchy groups={hierarchyRows} />
        </main>
        <AppRouterContext.Provider value={router}>
          <GroupDetailDialog name="Altos">
            <h1>Altos</h1>
          </GroupDetailDialog>
        </AppRouterContext.Provider>
      </>,
    )

    expect(screen.getByRole('dialog', { name: 'Altos' })).toBeTruthy()
    expect(screen.getAllByText('Choir')).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(replace).toHaveBeenCalledTimes(1)
    expect(screen.getAllByText('Choir')).toHaveLength(2)
  })
})

const hierarchyRows = [
  {
    id: 'choir',
    name: 'Choir',
    kind: GroupKind.CHOIR,
    depth: 0,
    memberCounts: { ACTIVE: 1, PASSIVE: 1, FORMER: 1 },
  },
]

const router = {
  back() {},
  forward() {},
  prefetch: async () => {},
  push() {},
  refresh() {},
  replace,
} as never

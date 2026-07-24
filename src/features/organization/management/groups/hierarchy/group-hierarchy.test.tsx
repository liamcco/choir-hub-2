import { beforeEach, describe, expect, test } from 'bun:test'
import { GroupKind } from '@/drizzle/schema'
import { GroupHierarchy } from './group-hierarchy'

const { cleanup, render, screen } = await import('@testing-library/react')
const userEvent = (await import('@testing-library/user-event')).default

beforeEach(cleanup)

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
})

import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { getChoir, getSection } from '@/core/topology'
import { MemberStatus } from '@/drizzle/schema'

mock.module('@/features/organization/management/placement/actions', () => ({
  transferPlacementAction: mock(async () => ({})),
  updatePlacementStatusAction: mock(async () => ({})),
}))

const { cleanup, render, screen } = await import('@testing-library/react')
const { PlacementDetail } = await import('./detail')

beforeEach(() => cleanup())

const currentChoir = getChoir('kk')
const currentSection = getSection('kk-b')
if (!currentChoir || !currentSection) throw new Error('Test topology is incomplete')
const currentPlacementStartsAt = new Date('2024-07-01')

const baseDetail = {
  id: 'user-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  status: MemberStatus.ACTIVE,
  choirId: 'kk',
  sectionId: 'kk-b',
  voice: 'B1' as const,
  currentChoir,
  currentSection,
  currentPlacementStartsAt,
}

describe('PlacementDetail history', () => {
  test('shows when the current placement started', () => {
    render(<PlacementDetail detail={{ ...baseDetail, history: [] }} />)

    expect(screen.getByText(`since ${currentPlacementStartsAt.toLocaleDateString()}`)).toBeTruthy()
  })

  test('shows ended section memberships as full placement names', () => {
    render(
      <PlacementDetail
        detail={{
          ...baseDetail,
          history: [
            {
              label: 'KKB1',
              startsAt: new Date('2024-01-01'),
              endsAt: new Date('2024-06-01'),
            },
          ],
        }}
      />,
    )

    expect(screen.getByRole('heading', { name: 'History' })).toBeTruthy()
    expect(screen.getAllByText('KKB1')).toHaveLength(2)
    expect(screen.queryByText('Section Placement: KKB1')).toBeNull()
  })

  test('hides history when there are no ended section memberships', () => {
    render(<PlacementDetail detail={{ ...baseDetail, history: [] }} />)

    expect(screen.queryByRole('heading', { name: 'History' })).toBeNull()
    expect(screen.queryByText('No previous placement history.')).toBeNull()
  })
})

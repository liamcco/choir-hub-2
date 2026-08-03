import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { UserDisplayOption } from '@/features/organization/core/labels'

mock.module('../../position-assignments/actions', () => ({
  createPositionAssignmentAction: async () => ({}),
  endPositionAssignmentAction: async () => ({}),
}))

const { cleanup, render, screen } = await import('@testing-library/react')
const { PositionDetail } = await import('./position-detail')

beforeEach(cleanup)

const basePosition = {
  position: { id: 'president' as const, name: 'President' },
  groups: [],
  choirs: [],
  sections: [],
  positionScopes: [],
  scopeLabel: 'Board',
  users: [
    {
      user: { id: 'user-1' },
      label: 'Ada Lovelace',
      detail: 'ada@example.com',
    },
  ] as unknown as UserDisplayOption[],
}

describe('Position detail', () => {
  test('shows only End for the current holder and places previous holders below', () => {
    render(
      <PositionDetail
        position={{
          ...basePosition,
          currentAssignments: [
            {
              id: 'assignment-1',
              positionId: 'position-1',
              userId: 'user-1',
              startsAt: new Date('2025-01-01'),
              endsAt: null,
              userLabel: 'Ada Lovelace',
              userDetail: 'ada@example.com',
            },
          ],
          historicalAssignments: [
            {
              id: 'assignment-2',
              positionId: 'position-1',
              userId: 'user-2',
              startsAt: new Date('2024-01-01'),
              endsAt: new Date('2024-12-31'),
              userLabel: 'Grace Hopper',
              userDetail: 'grace@example.com',
            },
          ],
        }}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Current assignment' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Previous holders' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'End' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Assign Holder' })).toBeNull()
    expect(screen.queryByText('ada@example.com')).toBeNull()
    expect(screen.getByText('Grace Hopper')).toBeTruthy()
  })

  test('shows Assign Holder in the vacant box and opens an inline assignment draft', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    render(<PositionDetail position={{ ...basePosition, currentAssignments: [], historicalAssignments: [] }} />)

    expect(screen.getByText('Vacant Position')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Assign Holder' }))
    expect(screen.getByLabelText('User')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Assign' })).toBeTruthy()
    expect(screen.queryByText('Vacant Position')).toBeNull()
    const currentAssignmentSection = screen.getByRole('heading', { name: 'Current assignment' }).closest('section')
    expect(currentAssignmentSection?.querySelector('.border-dashed')).toBeNull()
  })
})

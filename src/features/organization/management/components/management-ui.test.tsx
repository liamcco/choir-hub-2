import { describe, expect, test } from 'bun:test'
import { render, screen } from '@testing-library/react'
import { DatedRelationships } from './dated-relationships'
import { ReferenceSummary } from './reference-summary'

describe('composable organization management UI', () => {
  test('renders reference read models without persistence details', () => {
    render(
      <ReferenceSummary
        items={[
          { label: 'Scope', value: 'CSK-wide' },
          { label: 'Kind', value: 'Committee' },
        ]}
      />,
    )
    expect(screen.getByText('CSK-wide')).toBeTruthy()
    expect(screen.getByText('Committee')).toBeTruthy()
  })

  test('renders current and historical dated relationships accessibly', () => {
    render(
      <DatedRelationships
        title="Membership history"
        relationships={[
          {
            id: 'current',
            label: 'Concert Mastery',
            startsAt: new Date('2025-01-01T00:00:00Z'),
            endsAt: null,
          },
          {
            id: 'past',
            label: 'Tour Committee',
            startsAt: new Date('2024-01-01T00:00:00Z'),
            endsAt: new Date('2024-12-31T00:00:00Z'),
          },
        ]}
      />,
    )
    expect(screen.getByRole('region', { name: 'Membership history' })).toBeTruthy()
    expect(screen.getByText('Concert Mastery')).toBeTruthy()
    expect(screen.getByText('Tour Committee')).toBeTruthy()
    expect(screen.getByText(/Present/)).toBeTruthy()
  })
})

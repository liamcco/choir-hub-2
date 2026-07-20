import { describe, expect, test } from 'bun:test'
import {
  findOverlappingDatedPeriod,
  isCurrentDatedPeriod,
  isHistoricalDatedPeriod,
  isScheduledDatedPeriod,
  normalizeDatedPeriodInput,
  normalizeDatedPeriodUpdate,
} from '@/features/organization/core/dated-history'

describe('dated history', () => {
  test('normalizes open-ended periods and rejects periods that do not move forward', () => {
    expect(
      normalizeDatedPeriodInput({
        startsAt: date('2026-01-01'),
      }),
    ).toEqual({
      startsAt: date('2026-01-01'),
      endsAt: null,
    })

    expect(() =>
      normalizeDatedPeriodInput({
        startsAt: date('2026-01-01'),
        endsAt: date('2026-01-01'),
      }),
    ).toThrow('The end date must be after the start date.')
  })

  test('normalizes update inputs without turning omitted end dates into clearing writes', () => {
    const explicitUndefinedEndDate: { endsAt?: Date | null } = { endsAt: undefined }

    expect(
      normalizeDatedPeriodUpdate({
        startsAt: date('2026-01-01'),
      }),
    ).toEqual({
      startsAt: date('2026-01-01'),
      endsAt: undefined,
    })
    expect(normalizeDatedPeriodUpdate(explicitUndefinedEndDate)).toEqual({
      endsAt: null,
    })
    expect(
      normalizeDatedPeriodUpdate({
        endsAt: date('2026-06-01'),
      }),
    ).toEqual({
      endsAt: date('2026-06-01'),
    })
  })

  test('keeps current-at-date semantics half-open', () => {
    const period = {
      startsAt: date('2026-01-01'),
      endsAt: date('2026-02-01'),
    }

    expect(isCurrentDatedPeriod(period, date('2026-01-01'))).toBe(true)
    expect(isCurrentDatedPeriod(period, date('2026-02-01'))).toBe(false)
    expect(isHistoricalDatedPeriod(period, date('2026-02-01'))).toBe(true)
    expect(isScheduledDatedPeriod(period, date('2025-12-31'))).toBe(true)
  })

  test('detects overlapping periods while allowing adjacent periods', () => {
    const existingPeriods = [
      { id: 'first', startsAt: date('2026-01-01'), endsAt: date('2026-02-01') },
      { id: 'second', startsAt: date('2026-02-01'), endsAt: null },
    ]

    expect(
      findOverlappingDatedPeriod(existingPeriods, {
        startsAt: date('2025-12-01'),
        endsAt: date('2026-01-01'),
      }),
    ).toBeUndefined()
    expect(
      findOverlappingDatedPeriod(existingPeriods, {
        startsAt: date('2026-01-15'),
        endsAt: date('2026-01-20'),
      }),
    ).toMatchObject({ id: 'first' })
    expect(
      findOverlappingDatedPeriod(
        existingPeriods,
        {
          startsAt: date('2026-01-15'),
          endsAt: date('2026-01-20'),
        },
        'first',
      ),
    ).toBeUndefined()
  })
})

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

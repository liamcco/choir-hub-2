import { InvalidDatePeriodError } from '@/features/organization/core/errors'

export type DatedPeriod = {
  startsAt: Date
  endsAt: Date | null
}

export type DatedPeriodInput = {
  startsAt: Date
  endsAt?: Date | null
}

export type DatedPeriodUpdateInput = {
  startsAt?: Date
  endsAt?: Date | null
}

export function normalizeDatedPeriodInput<T extends DatedPeriodInput>(input: T): T & { endsAt: Date | null } {
  const normalized = {
    ...input,
    endsAt: input.endsAt ?? null,
  }

  assertValidDatedPeriod(normalized)
  return normalized
}

export function normalizeDatedPeriodUpdate<T extends DatedPeriodUpdateInput>(input: T): T & { endsAt?: Date | null } {
  return {
    ...input,
    endsAt: 'endsAt' in input ? (input.endsAt ?? null) : undefined,
  }
}

export function assertValidDatedPeriod(period: DatedPeriod) {
  if (period.endsAt && period.endsAt <= period.startsAt) {
    throw new InvalidDatePeriodError('The end date must be after the start date.', {
      field: 'endsAt',
    })
  }
}

export function isCurrentDatedPeriod(period: DatedPeriod, at: Date) {
  return period.startsAt <= at && (!period.endsAt || period.endsAt > at)
}

export function isHistoricalDatedPeriod(period: DatedPeriod, at: Date) {
  return !!period.endsAt && period.endsAt <= at
}

export function isScheduledDatedPeriod(period: Pick<DatedPeriod, 'startsAt'>, at: Date) {
  return period.startsAt > at
}

export function datedPeriodsOverlap(first: DatedPeriod, second: DatedPeriod) {
  const firstEnd = first.endsAt?.getTime() ?? Number.POSITIVE_INFINITY
  const secondEnd = second.endsAt?.getTime() ?? Number.POSITIVE_INFINITY

  return first.startsAt.getTime() < secondEnd && second.startsAt.getTime() < firstEnd
}

export function findOverlappingDatedPeriod<T extends DatedPeriod & { id: string }>(
  periods: T[],
  period: DatedPeriod,
  excludingPeriodId?: string,
) {
  return periods.find((candidate) => candidate.id !== excludingPeriodId && datedPeriodsOverlap(candidate, period))
}

import type { DatedPeriod } from '@/features/organization/core/dated-history'

export function normalizeOptionalString(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

export function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function formatPeriod(period: DatedPeriod) {
  return `${formatDate(period.startsAt)} - ${period.endsAt ? formatDate(period.endsAt) : 'Present'}`
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}

export function normalizeOptionalString(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

export function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function formatPeriod(period: { startsAt: Date; endsAt?: Date | null }) {
  return `${formatDate(period.startsAt)} - ${period.endsAt ? formatDate(period.endsAt) : 'Present'}`
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date)
}

export function normalizeOptionalString(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

export function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

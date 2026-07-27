export function normalizeSearchTerm(value: string) {
  return value.trim().toLocaleLowerCase()
}

export function matchesSearchText(value: string, searchTerm: string) {
  return !searchTerm || value.toLocaleLowerCase().includes(searchTerm)
}

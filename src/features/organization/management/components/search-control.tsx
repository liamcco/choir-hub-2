'use client'

import { SearchIcon } from 'lucide-react'
import { Input } from '@/shared/ui/input'

export function SearchControl({
  label,
  query,
  onQueryChange,
  displayedCount,
  totalCount,
  resourceName,
}: {
  label: string
  query: string
  onQueryChange: (query: string) => void
  displayedCount: number
  totalCount: number
  resourceName: string
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative block w-full sm:max-w-sm">
        <span className="sr-only">{label}</span>
        <SearchIcon
          aria-hidden="true"
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label={label}
          className="pl-9"
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          placeholder={label}
          type="search"
          value={query}
        />
      </label>
      <p aria-live="polite" className="text-sm text-muted-foreground" role="status">
        {displayedCount} of {totalCount} {resourceName} displayed
      </p>
    </div>
  )
}

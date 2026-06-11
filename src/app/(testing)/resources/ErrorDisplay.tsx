'use client'

import { Button } from '@/components/ui/button'

interface ErrorDisplayProps {
  error: Error | null
  onRetry: () => void
}

export default function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-destructive">
        Error fetching protected data: {error?.message || 'An unknown error occurred'}
      </p>
      <Button size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}

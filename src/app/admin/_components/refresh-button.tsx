import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function RefreshButton({
  isFetching,
  onRefresh,
}: {
  isFetching: boolean
  onRefresh: () => void
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      type="button"
      title="Refresh"
      aria-label="Refresh"
      disabled={isFetching}
      onClick={onRefresh}
    >
      <RefreshCw className={isFetching ? 'animate-spin' : undefined} />
    </Button>
  )
}

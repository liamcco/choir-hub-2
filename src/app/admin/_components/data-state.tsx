import type { ReactNode } from 'react'

import { getErrorMessage } from '@/common/errors/utils'
import { Skeleton } from '@/components/ui/skeleton'

type DataStateProps = {
  children: ReactNode
  error: unknown
  isPending: boolean
  loadingRows?: number
}

export function DataState({ children, error, isPending, loadingRows = 3 }: DataStateProps) {
  if (isPending) {
    return <LoadingRows rows={loadingRows} />
  }

  const errorMessage = getErrorMessage(error)

  if (errorMessage) {
    return <p className="text-sm text-destructive">{errorMessage}</p>
  }

  return children
}

export function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}

export function EmptyText({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

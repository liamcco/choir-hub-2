import { ReactNode } from 'react'

import { getErrorMessage } from '@/common/errors/utils'
import { Skeleton } from '@/components/ui/skeleton'

export function AsyncState({
  isPending,
  error,
  children,
}: {
  isPending: boolean
  error: unknown
  children: ReactNode
}) {
  if (isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  const errorMessage = getErrorMessage(error)

  if (errorMessage) {
    return <p className="text-sm text-destructive">{errorMessage}</p>
  }

  return children
}

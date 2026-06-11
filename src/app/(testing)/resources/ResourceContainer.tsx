'use client'

import { getResourcesOptions } from '@/lib/api-client/@tanstack/react-query.gen'
import { useQuery } from '@tanstack/react-query'
import ErrorDisplay from './ErrorDisplay'
import ResourceCardSkeletonGrid from './ResourceCardSkeletonGrid'
import ResourceList from './ResourceList'

export function ResourceContainer() {
  const { data, error, isPending, refetch } = useQuery(getResourcesOptions())

  if (isPending) {
    return <ResourceCardSkeletonGrid />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />
  }

  return <ResourceList resources={data?.resources ?? []} />
}

'use client'

import { useQuery } from '@tanstack/react-query'

import { getPeopleOptions } from '@/lib/api-client/@tanstack/react-query.gen'

import { AdminPeopleTable } from './AdminPeopleTable'

export function AdminPeoplePanel() {
  const peopleQuery = useQuery(getPeopleOptions())

  return (
    <div className="grid gap-6">
      <AdminPeopleTable
        people={peopleQuery.data?.people ?? []}
        isPending={peopleQuery.isPending}
        error={peopleQuery.error}
        isFetching={peopleQuery.isFetching}
        onRefresh={() => {
          void peopleQuery.refetch()
        }}
      />
    </div>
  )
}

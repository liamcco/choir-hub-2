'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { getPeopleOptions, getPeopleQueryKey } from '@/lib/api-client/@tanstack/react-query.gen'

import { AdminPeopleCsvImport } from './AdminPeopleCsvImport'
import { AdminPeopleTable } from './AdminPeopleTable'
import { AdminPersonCreateForm } from './AdminPersonCreateForm'

export function AdminPeoplePanel() {
  const queryClient = useQueryClient()
  const peopleQuery = useQuery(getPeopleOptions())

  const invalidatePeople = () => queryClient.invalidateQueries({ queryKey: getPeopleQueryKey() })

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <AdminPersonCreateForm onPeopleChanged={invalidatePeople} />
      <AdminPeopleCsvImport onPeopleChanged={invalidatePeople} />
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

'use client'

import { useQueryClient } from '@tanstack/react-query'

import { getPeopleQueryKey } from '@/lib/api-client/@tanstack/react-query.gen'

import { AdminPeopleCsvImport } from './AdminPeopleCsvImport'
import { AdminPersonCreateForm } from './AdminPersonCreateForm'

export function AdminPeopleCreatePanel() {
  const queryClient = useQueryClient()
  const invalidatePeople = () => queryClient.invalidateQueries({ queryKey: getPeopleQueryKey() })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AdminPersonCreateForm onPeopleChanged={invalidatePeople} />
      <AdminPeopleCsvImport onPeopleChanged={invalidatePeople} />
    </div>
  )
}

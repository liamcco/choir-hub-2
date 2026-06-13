'use client'

import { useQueryClient } from '@tanstack/react-query'

import { getUsersQueryKey } from '@/lib/api-client/@tanstack/react-query.gen'

import { CreateUserForm } from './CreateUserForm'
import { UsersCsvImport } from './UsersCsvImport'

export function AdminUsersCreatePanel() {
  const queryClient = useQueryClient()
  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: getUsersQueryKey() })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <CreateUserForm onUsersChanged={invalidateUsers} />
      <UsersCsvImport onUsersChanged={invalidateUsers} />
    </div>
  )
}

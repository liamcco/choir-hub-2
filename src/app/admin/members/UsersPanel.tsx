'use client'

import { useQuery } from '@tanstack/react-query'

import { getUsersOptions } from '@/lib/api-client/@tanstack/react-query.gen'

import { AdminUsersTable } from './UsersTable'

export function UsersPanel() {
  const usersQuery = useQuery(getUsersOptions())

  return (
    <div className="grid gap-6">
      <AdminUsersTable
        users={usersQuery.data ?? []}
        isPending={usersQuery.isPending}
        error={usersQuery.error}
        isFetching={usersQuery.isFetching}
        onRefresh={() => {
          void usersQuery.refetch()
        }}
      />
    </div>
  )
}

'use client'

import type { GetUsersResponse } from '@/lib/api-client/types.gen'

import { DataState, EmptyText } from '@/app/admin/_components/data-state'
import { RefreshButton } from '@/app/admin/_components/refresh-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type AdminUsersTableProps = {
  users: GetUsersResponse
  isPending: boolean
  isFetching: boolean
  error: unknown
  onRefresh: () => void
}

export function AdminUsersTable({ users, isPending, isFetching, error, onRefresh }: AdminUsersTableProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Users</CardTitle>
          <CardDescription>{users.length} created</CardDescription>
        </div>
        <RefreshButton isFetching={isFetching} onRefresh={onRefresh} />
      </CardHeader>
      <CardContent>
        <UsersList users={users} isPending={isPending} error={error} />
      </CardContent>
    </Card>
  )
}

function UsersList({ users, isPending, error }: { users: GetUsersResponse; isPending: boolean; error: unknown }) {
  return (
    <DataState isPending={isPending} error={error}>
      {users.length ? (
        <Table className="min-w-150">
          <TableHeader className="text-xs text-muted-foreground uppercase">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>User ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name ?? 'Missing user'}</TableCell>
                <TableCell className="text-muted-foreground">{user.email ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground">{user.role ?? '-'}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{user.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyText>No users created.</EmptyText>
      )}
    </DataState>
  )
}

'use client'

import { RefreshCw } from 'lucide-react'

import type { GetUsersResponse } from '@/lib/api-client/types.gen'

import { getErrorMessage } from '@/common/errors/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
    <Card className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
      <CardHeader className="grid-cols-[1fr_auto]">
        <div>
          <CardTitle>Users</CardTitle>
          <CardDescription>{users.length} created</CardDescription>
        </div>
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
      </CardHeader>
      <CardContent>
        <UsersList users={users} isPending={isPending} error={error} />
      </CardContent>
    </Card>
  )
}

function UsersList({ users, isPending, error }: { users: GetUsersResponse; isPending: boolean; error: unknown }) {
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

  if (!users.length) {
    return <p className="text-sm text-muted-foreground">No users created.</p>
  }

  return (
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
  )
}

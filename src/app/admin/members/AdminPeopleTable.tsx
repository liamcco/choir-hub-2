'use client'

import { RefreshCw } from 'lucide-react'

import type { GetPeopleResponse } from '@/lib/api-client/types.gen'

import { getErrorMessage } from '@/common/errors/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type AdminPeopleTableProps = {
  people: GetPeopleResponse['people']
  isPending: boolean
  isFetching: boolean
  error: unknown
  onRefresh: () => void
}

export function AdminPeopleTable({ people, isPending, isFetching, error, onRefresh }: AdminPeopleTableProps) {
  return (
    <Card className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
      <CardHeader className="grid-cols-[1fr_auto]">
        <div>
          <CardTitle>Persons</CardTitle>
          <CardDescription>{people.length} provisioned</CardDescription>
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
        <PeopleList people={people} isPending={isPending} error={error} />
      </CardContent>
    </Card>
  )
}

function PeopleList({
  people,
  isPending,
  error,
}: {
  people: GetPeopleResponse['people']
  isPending: boolean
  error: unknown
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

  if (!people.length) {
    return <p className="text-sm text-muted-foreground">No persons provisioned.</p>
  }

  return (
    <Table className="min-w-150">
      <TableHeader className="text-xs text-muted-foreground uppercase">
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Person ID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {people.map((person) => (
          <TableRow key={person.id}>
            <TableCell className="font-medium">{person.user?.name ?? 'Missing user'}</TableCell>
            <TableCell className="text-muted-foreground">{person.user?.email ?? '-'}</TableCell>
            <TableCell className="text-muted-foreground">{person.user?.role ?? '-'}</TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">{person.id}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

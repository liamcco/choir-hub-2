'use client'

import { useMutation } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'

import { DataState } from '@/app/admin/_components/data-state'
import { getErrorMessage } from '@/common/errors/utils'
import type { Group, GroupKind } from '@/common/groups/types'
import { FormError } from '@/common/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { deleteGroupKindMutation } from '@/lib/api-client/@tanstack/react-query.gen'

export function GroupKindsTable({
  groupKinds,
  groups,
  isPending,
  error,
  onChanged,
}: {
  groupKinds: GroupKind[]
  groups: Group[]
  isPending: boolean
  error: unknown
  onChanged: () => Promise<unknown>
}) {
  const deleteMutation = useMutation(deleteGroupKindMutation())
  const groupUsageCounts = getGroupKindUsageCounts(groups)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Kinds</CardTitle>
        <CardDescription>{groupKinds.length} configured</CardDescription>
      </CardHeader>
      <CardContent>
        <DataState isPending={isPending} error={error}>
          <>
            <Table className="min-w-120">
              <TableHeader className="text-xs text-muted-foreground uppercase">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Used By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupKinds.map((kind) => {
                  const usedByCount = groupUsageCounts.get(kind.id) ?? 0

                  return (
                    <TableRow key={kind.id}>
                      <TableCell className="font-medium">{kind.name}</TableCell>
                      <TableCell className="text-muted-foreground">{usedByCount}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="destructive"
                          title="Delete kind"
                          aria-label="Delete kind"
                          disabled={deleteMutation.isPending || usedByCount > 0}
                          onClick={async () => {
                            await deleteMutation.mutateAsync({ path: { kindId: kind.id } })
                            await onChanged()
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <FormError error={getErrorMessage(deleteMutation.error)} />
          </>
        </DataState>
      </CardContent>
    </Card>
  )
}

function getGroupKindUsageCounts(groups: Group[]) {
  const usageCounts = new Map<string, number>()

  for (const group of groups) {
    usageCounts.set(group.kindId, (usageCounts.get(group.kindId) ?? 0) + 1)
  }

  return usageCounts
}

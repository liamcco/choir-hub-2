'use client'

import { useMemo } from 'react'
import { RefreshCw } from 'lucide-react'

import type { Group } from '@/common/groups/types'
import { AsyncState } from '@/common/ui/async-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function GroupsTable({
  groups,
  selectedGroupId,
  isPending,
  isFetching,
  error,
  onSelectGroup,
  onRefresh,
}: {
  groups: Group[]
  selectedGroupId: string | null
  isPending: boolean
  isFetching: boolean
  error: unknown
  onSelectGroup: (id: string) => void
  onRefresh: () => void
}) {
  const groupsById = useMemo(() => new Map(groups.map((group) => [group.id, group])), [groups])

  return (
    <Card className="lg:row-span-2">
      <CardHeader className="grid-cols-[1fr_auto]">
        <div>
          <CardTitle>Groups</CardTitle>
          <CardDescription>{groups.length} configured</CardDescription>
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
        <AsyncState isPending={isPending} error={error}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-left text-sm">
              <thead className="border-b text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Kind</th>
                  <th className="py-2 pr-4 font-medium">Parent</th>
                  <th className="py-2 pr-4 font-medium">State</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {groups.map((group) => (
                  <tr
                    key={group.id}
                    className={selectedGroupId === group.id ? 'bg-muted/60' : undefined}
                    onClick={() => onSelectGroup(group.id)}
                  >
                    <td className="py-3 pr-4 font-medium">{group.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{group.kind?.name ?? '-'}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {group.parentGroupId ? (groupsById.get(group.parentGroupId)?.name ?? 'Missing parent') : 'Root'}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {group.active ? 'Active' : 'Inactive'}
                      {group.isContainer ? ' / Container' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!groups.length ? <p className="text-sm text-muted-foreground">No groups configured.</p> : null}
        </AsyncState>
      </CardContent>
    </Card>
  )
}

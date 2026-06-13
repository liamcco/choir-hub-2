'use client'

import Link from 'next/link'

import type { Group } from '@/common/groups/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function OrgStructure({ groups }: { groups: Group[] }) {
  const rootGroups = groups.filter((group) => !group.parentGroupId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Org Structure</CardTitle>
        <CardDescription>{groups.length} groups in the hierarchy</CardDescription>
      </CardHeader>
      <CardContent>
        {rootGroups.length ? (
          <div className="space-y-2">
            {rootGroups.map((group) => (
              <GroupBranch key={group.id} group={group} groups={groups} depth={0} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No groups configured.</p>
        )}
      </CardContent>
    </Card>
  )
}

function GroupBranch({ group, groups, depth }: { group: Group; groups: Group[]; depth: number }) {
  const children = groups.filter((candidate) => candidate.parentGroupId === group.id)

  return (
    <div>
      <Link
        href={`/admin/groups/${group.id}`}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
        style={{ marginLeft: depth * 16 }}
      >
        <span className="font-medium">{group.name}</span>
        <span className="text-muted-foreground">{group.kindName}</span>
        {group.isContainer ? <span className="text-muted-foreground">Container</span> : null}
      </Link>
      {children.map((child) => (
        <GroupBranch key={child.id} group={child} groups={groups} depth={depth + 1} />
      ))}
    </div>
  )
}

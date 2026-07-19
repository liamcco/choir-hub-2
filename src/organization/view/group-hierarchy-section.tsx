import { GitForkIcon } from 'lucide-react'
import { EmptyState } from '@/components/assignments/empty-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatGroupKind } from '@/organization/group-kind'
import type { OrganizationalReadOnlyState, ReadOnlyGroupHierarchyNode } from '@/organization/view/service'

export function GroupHierarchySection({
  groupCount,
  groupHierarchy,
}: {
  groupCount: number
  groupHierarchy: OrganizationalReadOnlyState['groupHierarchy']
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Group Hierarchy</CardTitle>
        <CardDescription>{groupCount} total</CardDescription>
      </CardHeader>
      <CardContent>
        {groupHierarchy.length ? (
          <div className="flex flex-col gap-2">
            {groupHierarchy.map((node) => (
              <GroupHierarchyBranch key={node.group.id} node={node} />
            ))}
          </div>
        ) : (
          <EmptyState label="No Groups" />
        )}
      </CardContent>
    </Card>
  )
}

function GroupHierarchyBranch({ node }: { node: ReadOnlyGroupHierarchyNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn('flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm', node.depth > 0 && 'ml-4')}
        style={{ marginLeft: `${node.depth * 1}rem` }}
      >
        <GitForkIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="font-medium">{node.group.name}</span>
        <Badge variant="secondary">{formatGroupKind(node.group.kind)}</Badge>
      </div>
      {node.children.map((child) => (
        <GroupHierarchyBranch key={child.group.id} node={child} />
      ))}
    </div>
  )
}

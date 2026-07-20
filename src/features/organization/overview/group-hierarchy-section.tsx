import { GitForkIcon } from 'lucide-react'
import { EmptyState } from '@/features/organization/components/empty-state'
import { formatGroupKind } from '@/features/organization/core/group-kind'
import type { OrganizationOverviewState, OverviewGroupHierarchyNode } from '@/features/organization/overview/service'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { cn } from '@/shared/utils'

export function GroupHierarchySection({
  groupCount,
  groupHierarchy,
}: {
  groupCount: number
  groupHierarchy: OrganizationOverviewState['groupHierarchy']
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

function GroupHierarchyBranch({ node }: { node: OverviewGroupHierarchyNode }) {
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

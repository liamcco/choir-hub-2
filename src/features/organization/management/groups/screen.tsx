import { Building2Icon, GitForkIcon } from 'lucide-react'
import { formatGroupKind } from '@/features/organization'
import { buildGroupTree, type GroupTreeNode } from '@/features/organization/core/group-tree'
import { CreateGroupForm, UpdateGroupForm } from '@/features/organization/management/groups/group-form'
import { listGroups } from '@/features/organization/management/groups/service'
import type { Group } from '@/prisma/generated/client'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { cn } from '@/shared/utils'

export async function GroupManagementScreen() {
  const groups = await listGroups()
  const hierarchy = buildGroupTree(groups)

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-normal">Groups</h1>
        <p className="text-muted-foreground text-sm">Organizational hierarchy and Group Kinds</p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(18rem,24rem)_1fr] xl:items-start">
        <div className="grid gap-6">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Create Group</CardTitle>
              <CardDescription>Name, Group Kind, and optional parent Group</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateGroupForm groups={groups} />
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Hierarchy</CardTitle>
              <CardDescription>{groups.length} total</CardDescription>
            </CardHeader>
            <CardContent>
              {hierarchy.length ? (
                <div className="flex flex-col gap-2">
                  {hierarchy.map((node) => (
                    <GroupHierarchyBranch key={node.group.id} node={node} />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
                  No Groups
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Edit Groups</CardTitle>
            <CardDescription>Sibling Group names must be unique</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {groups.length ? (
              groups.map((group) => (
                <div key={group.id} className="rounded-lg border p-4">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Building2Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span className="font-medium">{group.name}</span>
                    <Badge variant="outline">{formatGroupKind(group.kind)}</Badge>
                  </div>
                  <UpdateGroupForm group={group} groups={groups} />
                </div>
              ))
            ) : (
              <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
                No Groups
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function GroupHierarchyBranch({ node }: { node: GroupTreeNode<Group> }) {
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

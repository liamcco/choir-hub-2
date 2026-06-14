import Link from 'next/link'

import type { Group, Position } from '@/common/groups/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const rootParentKey = '__root__'

export function OrgStructure({ groups, positions }: { groups: Group[]; positions: Position[] }) {
  const groupsByParentId = groupByParentId(groups)
  const positionsByGroupId = groupPositionsByGroupId(positions)
  const rootGroups = groupsByParentId.get(rootParentKey) ?? []
  const positionCount = positions.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Org Structure</CardTitle>
        <CardDescription>
          {groups.length} groups / {positionCount} positions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rootGroups.length ? (
          <div className="space-y-2">
            {rootGroups.map((group) => (
              <GroupBranch
                key={group.id}
                group={group}
                groupsByParentId={groupsByParentId}
                positionsByGroupId={positionsByGroupId}
                depth={0}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No groups configured.</p>
        )}
      </CardContent>
    </Card>
  )
}

function GroupBranch({
  group,
  groupsByParentId,
  positionsByGroupId,
  depth,
}: {
  group: Group
  groupsByParentId: Map<string, Group[]>
  positionsByGroupId: Map<string, Position[]>
  depth: number
}) {
  const children = groupsByParentId.get(group.id) ?? []
  const positions = positionsByGroupId.get(group.id) ?? []

  return (
    <div>
      <Link
        href={`/admin/groups/${group.id}`}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
        style={{ marginLeft: depth * 16 }}
      >
        <span className="font-medium">{group.name}</span>
        <span className="text-muted-foreground">{group.effectiveMemberCount}</span>
        {group.isContainer ? <span className="text-muted-foreground">Container</span> : null}
      </Link>
      {positions.length ? (
        <div className="space-y-1 py-1" style={{ marginLeft: depth * 16 + 20 }}>
          {positions.map((position) => (
            <PositionLine key={position.id} position={position} />
          ))}
        </div>
      ) : null}
      {children.map((child) => (
        <GroupBranch
          key={child.id}
          group={child}
          groupsByParentId={groupsByParentId}
          positionsByGroupId={positionsByGroupId}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

function PositionLine({ position }: { position: Position }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md px-2 py-1 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{position.name}</span>
      <span>{position.currentHolder ? position.currentHolder.name : 'Vacant'}</span>
    </div>
  )
}

function groupByParentId(groups: Group[]) {
  const groupsByParentId = new Map<string, Group[]>()

  for (const group of groups) {
    const parentKey = group.parentGroupId ?? rootParentKey
    const siblings = groupsByParentId.get(parentKey) ?? []
    siblings.push(group)
    groupsByParentId.set(parentKey, siblings)
  }

  return groupsByParentId
}

function groupPositionsByGroupId(positions: Position[]) {
  const positionsByGroupId = new Map<string, Position[]>()

  for (const position of positions) {
    for (const groupId of position.groupIds) {
      const groupPositions = positionsByGroupId.get(groupId) ?? []
      groupPositions.push(position)
      positionsByGroupId.set(groupId, groupPositions)
    }
  }

  return positionsByGroupId
}

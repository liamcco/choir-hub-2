import { BriefcaseBusiness, Users } from 'lucide-react'

import type { UserOrgPlacement } from '@/api/services/users/userService'
import { groupByParentId, groupPositionsByGroupId, rootParentKey } from '@/common/groups/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type OrgGroup = UserOrgPlacement['groups'][number]
type OrgPosition = UserOrgPlacement['positions'][number]

export function OrgPlacementCard({ placement }: { placement: UserOrgPlacement }) {
  const groupsByParentId = groupByParentId(placement.groups)
  const positionsByGroupId = groupPositionsByGroupId(placement.positions)
  const directGroupIds = new Set(placement.directGroupIds)
  const rootGroups = groupsByParentId.get(rootParentKey) ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Place In The Org</CardTitle>
        <CardDescription>
          {placement.directGroupIds.length} memberships / {placement.positions.length} held positions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rootGroups.length ? (
          <div className="space-y-2">
            {rootGroups.map((group) => (
              <OrgGroupBranch
                key={group.id}
                group={group}
                groupsByParentId={groupsByParentId}
                positionsByGroupId={positionsByGroupId}
                directGroupIds={directGroupIds}
                depth={0}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No group memberships or held positions.</p>
        )}
      </CardContent>
    </Card>
  )
}

function OrgGroupBranch({
  group,
  groupsByParentId,
  positionsByGroupId,
  directGroupIds,
  depth,
}: {
  group: OrgGroup
  groupsByParentId: Map<string, OrgGroup[]>
  positionsByGroupId: Map<string, OrgPosition[]>
  directGroupIds: Set<string>
  depth: number
}) {
  const children = groupsByParentId.get(group.id) ?? []
  const positions = positionsByGroupId.get(group.id) ?? []
  const isDirectMember = directGroupIds.has(group.id)

  return (
    <div>
      <div
        className="flex flex-wrap items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        style={{ marginLeft: depth * 16 }}
      >
        <span className="font-medium">{group.name}</span>
        {isDirectMember ? (
          <Badge variant="secondary">
            <Users />
            Member
          </Badge>
        ) : null}
      </div>
      {positions.length ? (
        <div className="space-y-1 py-1" style={{ marginLeft: depth * 16 + 20 }}>
          {positions.map((position) => (
            <div
              key={position.id}
              className="flex flex-wrap items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground"
            >
              <Badge variant="outline">
                <BriefcaseBusiness />
                Position
              </Badge>
              <span className="font-medium text-foreground">{position.name}</span>
            </div>
          ))}
        </div>
      ) : null}
      {children.map((child) => (
        <OrgGroupBranch
          key={child.id}
          group={child}
          groupsByParentId={groupsByParentId}
          positionsByGroupId={positionsByGroupId}
          directGroupIds={directGroupIds}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

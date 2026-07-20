import { UsersIcon } from 'lucide-react'
import { formatGroupKind } from '@/features/organization'
import { EmptyState } from '@/features/organization/components/empty-state'
import { Period } from '@/features/organization/components/period'
import { formatGroupPath } from '@/features/organization/core/labels'
import { EndGroupMembershipForm } from '@/features/organization/management/group-memberships/membership-form'
import type {
  GroupMembershipGroupView,
  GroupMembershipManagementState,
  GroupMembershipMemberView,
  GroupMembershipPeriod,
} from '@/features/organization/management/group-memberships/service'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export function GroupMembershipSectionsCard({
  groupViews,
}: {
  groupViews: GroupMembershipManagementState['groupViews']
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Group Members</CardTitle>
        <CardDescription>Current and historical membership periods by Group</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {groupViews.length ? (
          groupViews.map((view) => <GroupMembershipGroupSection key={view.group.id} view={view} />)
        ) : (
          <EmptyState label="No Groups" />
        )}
      </CardContent>
    </Card>
  )
}

export function MemberGroupMembershipSectionsCard({
  groups,
  memberViews,
}: {
  groups: GroupMembershipManagementState['groups']
  memberViews: GroupMembershipManagementState['memberViews']
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Member Groups</CardTitle>
        <CardDescription>Current and historical Groups by Member</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {memberViews.length ? (
          memberViews.map((view) => <MemberGroupMembershipSection key={view.member.id} groups={groups} view={view} />)
        ) : (
          <EmptyState label="No Members" />
        )}
      </CardContent>
    </Card>
  )
}

function GroupMembershipGroupSection({ view }: { view: GroupMembershipGroupView }) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <UsersIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="font-medium">{view.group.name}</span>
        <Badge variant="outline">{formatGroupKind(view.group.kind)}</Badge>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <MembershipTable title="Current Members" emptyLabel="No current Members" rows={view.currentMemberships} />
        <MembershipTable title="Scheduled Members" emptyLabel="No scheduled Members" rows={view.scheduledMemberships} />
        <MembershipTable
          title="Historical Members"
          emptyLabel="No historical Members"
          rows={view.historicalMemberships}
        />
      </div>
    </section>
  )
}

function MemberGroupMembershipSection({
  groups,
  view,
}: {
  groups: GroupMembershipManagementState['groups']
  view: GroupMembershipMemberView
}) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <UsersIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="font-medium">{view.memberLabel}</span>
        <span className="text-muted-foreground text-sm">{view.memberDetail}</span>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <MemberGroupsTable
          groups={groups}
          title="Current Groups"
          emptyLabel="No current Groups"
          rows={view.currentMemberships}
        />
        <MemberGroupsTable
          groups={groups}
          title="Scheduled Groups"
          emptyLabel="No scheduled Groups"
          rows={view.scheduledMemberships}
        />
        <MemberGroupsTable
          groups={groups}
          title="Historical Groups"
          emptyLabel="No historical Groups"
          rows={view.historicalMemberships}
        />
      </div>
    </section>
  )
}

function MembershipTable({
  title,
  emptyLabel,
  rows,
}: {
  title: string
  emptyLabel: string
  rows: GroupMembershipPeriod[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-medium text-sm">{title}</h2>
      {rows.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">End</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((membership) => (
              <TableRow key={membership.id}>
                <TableCell>
                  <div className="flex min-w-40 flex-col gap-0.5">
                    <span className="font-medium">{membership.memberLabel}</span>
                    <span className="text-muted-foreground text-xs">{membership.memberDetail}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Period startsAt={membership.startsAt} endsAt={membership.endsAt} />
                </TableCell>
                <TableCell className="text-right">
                  {membership.endsAt ? (
                    <span className="text-muted-foreground text-sm">Ended</span>
                  ) : (
                    <EndGroupMembershipForm membership={membership} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState label={emptyLabel} />
      )}
    </div>
  )
}

function MemberGroupsTable({
  groups,
  title,
  emptyLabel,
  rows,
}: {
  groups: GroupMembershipManagementState['groups']
  title: string
  emptyLabel: string
  rows: GroupMembershipPeriod[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-medium text-sm">{title}</h2>
      {rows.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group</TableHead>
              <TableHead>Period</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((membership) => (
              <TableRow key={membership.id}>
                <TableCell>{formatGroupPath(groups, membership.group)}</TableCell>
                <TableCell>
                  <Period startsAt={membership.startsAt} endsAt={membership.endsAt} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState label={emptyLabel} />
      )}
    </div>
  )
}

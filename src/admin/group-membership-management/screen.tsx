import { CalendarRangeIcon, UsersIcon } from 'lucide-react'
import { formatGroupKind } from '@/admin/group-management/group-kind'
import { formatGroupPath } from '@/admin/group-management/group-labels'
import { CreateGroupMembershipForm, EndGroupMembershipForm } from '@/admin/group-membership-management/membership-form'
import type {
  GroupMembershipGroupView,
  GroupMembershipManagementState,
  GroupMembershipMemberView,
  GroupMembershipPeriod,
} from '@/admin/group-membership-management/service'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function GroupMembershipManagementScreen({ state }: { state: GroupMembershipManagementState }) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-normal">Group Memberships</h1>
        <p className="text-muted-foreground text-sm">Dated Member periods in Groups</p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(18rem,24rem)_1fr] xl:items-start">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Add Member to Group</CardTitle>
            <CardDescription>Choose a Member, Group, and start date</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateGroupMembershipForm groups={state.groups} members={state.members} />
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Group Members</CardTitle>
            <CardDescription>Current and historical membership periods by Group</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {state.groupViews.length ? (
              state.groupViews.map((view) => <GroupMembershipGroupSection key={view.group.id} view={view} />)
            ) : (
              <EmptyState label="No Groups" />
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Member Groups</CardTitle>
          <CardDescription>Current and historical Groups by Member</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {state.memberViews.length ? (
            state.memberViews.map((view) => (
              <MemberGroupMembershipSection key={view.member.id} groups={state.groups} view={view} />
            ))
          ) : (
            <EmptyState label="No Members" />
          )}
        </CardContent>
      </Card>
    </main>
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
                  <MembershipPeriod membership={membership} />
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
                  <MembershipPeriod membership={membership} />
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

function MembershipPeriod({ membership }: { membership: GroupMembershipPeriod }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <CalendarRangeIcon className="size-4 text-muted-foreground" aria-hidden="true" />
      {formatDate(membership.startsAt)} {membership.endsAt ? `to ${formatDate(membership.endsAt)}` : 'onward'}
    </span>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
      {label}
    </div>
  )
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}

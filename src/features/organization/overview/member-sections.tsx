import { UserRoundIcon } from 'lucide-react'
import { EmptyState } from '@/features/organization/components/empty-state'
import { Period } from '@/features/organization/components/period'
import type {
  OrganizationOverviewState,
  OverviewGroupMembershipPeriod,
  OverviewMemberView,
  OverviewPositionAssignmentPeriod,
} from '@/features/organization/overview/service'
import type { MemberStatus } from '@/prisma/generated/client'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export function MemberHistorySection({ memberViews }: { memberViews: OrganizationOverviewState['memberViews'] }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>Current and historical Group Memberships</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {memberViews.length ? (
          memberViews.map((view) => <MemberSection key={view.member.id} view={view} />)
        ) : (
          <EmptyState label="No Members" />
        )}
      </CardContent>
    </Card>
  )
}

function MemberSection({ view }: { view: OverviewMemberView }) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <UserRoundIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="font-medium">{view.memberLabel}</span>
        <span className="text-muted-foreground text-sm">{view.memberDetail}</span>
        <Badge variant="outline">{formatMemberStatus(view.member.status)}</Badge>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <MembershipTable
          title="Current Group Memberships"
          emptyLabel="No current Group Memberships"
          rows={view.currentMemberships}
        />
        <MembershipTable
          title="Historical Group Memberships"
          emptyLabel="No historical Group Memberships"
          rows={view.historicalMemberships}
        />
        <MemberAssignmentTable
          title="Current Positions"
          emptyLabel="No current Positions"
          rows={view.currentAssignments}
        />
        <MemberAssignmentTable
          title="Historical Positions"
          emptyLabel="No historical Positions"
          rows={view.historicalAssignments}
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
  rows: OverviewGroupMembershipPeriod[]
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
                <TableCell>{membership.groupPath}</TableCell>
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

function MemberAssignmentTable({
  title,
  emptyLabel,
  rows,
}: {
  title: string
  emptyLabel: string
  rows: OverviewPositionAssignmentPeriod[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-medium text-sm">{title}</h2>
      {rows.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Period</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>{assignment.positionLabel}</TableCell>
                <TableCell>{assignment.positionScopeLabel}</TableCell>
                <TableCell>
                  <Period startsAt={assignment.startsAt} endsAt={assignment.endsAt} />
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

function formatMemberStatus(status: MemberStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

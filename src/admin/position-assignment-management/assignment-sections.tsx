import { BriefcaseBusinessIcon, UserRoundIcon } from 'lucide-react'
import { EndPositionAssignmentForm } from '@/admin/position-assignment-management/assignment-form'
import type {
  PositionAssignmentManagementState,
  PositionAssignmentMemberView,
  PositionAssignmentPeriod,
  PositionAssignmentPositionView,
} from '@/admin/position-assignment-management/service'
import { EmptyState } from '@/components/assignments/empty-state'
import { Period } from '@/components/assignments/period'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function PositionHolderSectionsCard({
  positionViews,
}: {
  positionViews: PositionAssignmentManagementState['positionViews']
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Position Holders</CardTitle>
        <CardDescription>Current and historical holders by Position</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {positionViews.length ? (
          positionViews.map((view) => <PositionHolderSection key={view.position.id} view={view} />)
        ) : (
          <EmptyState label="No Positions" />
        )}
      </CardContent>
    </Card>
  )
}

export function MemberPositionSectionsCard({
  memberViews,
}: {
  memberViews: PositionAssignmentManagementState['memberViews']
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Member Positions</CardTitle>
        <CardDescription>Current and historical Positions by Member</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {memberViews.length ? (
          memberViews.map((view) => <MemberPositionSection key={view.member.id} view={view} />)
        ) : (
          <EmptyState label="No Members" />
        )}
      </CardContent>
    </Card>
  )
}

function PositionHolderSection({ view }: { view: PositionAssignmentPositionView }) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <BriefcaseBusinessIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="font-medium">{view.positionLabel}</span>
        {view.position.description ? (
          <span className="text-muted-foreground text-sm">{view.position.description}</span>
        ) : null}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <HolderTable title="Current Holder" emptyLabel="No current holder" rows={view.currentAssignments} />
        <HolderTable title="Historical Holders" emptyLabel="No historical holders" rows={view.historicalAssignments} />
      </div>
    </section>
  )
}

function MemberPositionSection({ view }: { view: PositionAssignmentMemberView }) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <UserRoundIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="font-medium">{view.memberLabel}</span>
        <span className="text-muted-foreground text-sm">{view.memberDetail}</span>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <MemberPositionsTable
          title="Current Positions"
          emptyLabel="No current Positions"
          rows={view.currentAssignments}
        />
        <MemberPositionsTable
          title="Historical Positions"
          emptyLabel="No historical Positions"
          rows={view.historicalAssignments}
        />
      </div>
    </section>
  )
}

function HolderTable({
  title,
  emptyLabel,
  rows,
}: {
  title: string
  emptyLabel: string
  rows: PositionAssignmentPeriod[]
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
            {rows.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>
                  <div className="flex min-w-40 flex-col gap-0.5">
                    <span className="font-medium">{assignment.memberLabel}</span>
                    <span className="text-muted-foreground text-xs">{assignment.memberDetail}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Period startsAt={assignment.startsAt} endsAt={assignment.endsAt} />
                </TableCell>
                <TableCell className="text-right">
                  {assignment.endsAt ? (
                    <span className="text-muted-foreground text-sm">Ended</span>
                  ) : (
                    <EndPositionAssignmentForm assignment={assignment} />
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

function MemberPositionsTable({
  title,
  emptyLabel,
  rows,
}: {
  title: string
  emptyLabel: string
  rows: PositionAssignmentPeriod[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-medium text-sm">{title}</h2>
      {rows.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Period</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>
                  <div className="flex min-w-40 flex-col gap-0.5">
                    <span className="font-medium">{assignment.positionLabel}</span>
                    <span className="text-muted-foreground text-xs">{assignment.position.description}</span>
                  </div>
                </TableCell>
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

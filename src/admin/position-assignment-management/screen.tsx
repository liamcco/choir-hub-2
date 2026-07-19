import { BriefcaseBusinessIcon, CalendarRangeIcon, UserRoundIcon } from 'lucide-react'
import {
  CreatePositionAssignmentForm,
  EndPositionAssignmentForm,
} from '@/admin/position-assignment-management/assignment-form'
import type {
  PositionAssignmentManagementState,
  PositionAssignmentMemberView,
  PositionAssignmentPeriod,
  PositionAssignmentPositionView,
} from '@/admin/position-assignment-management/service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function PositionAssignmentManagementScreen({ state }: { state: PositionAssignmentManagementState }) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-normal">Position Assignments</h1>
        <p className="text-muted-foreground text-sm">Dated Member holders for Positions</p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(18rem,24rem)_1fr] xl:items-start">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Assign Position</CardTitle>
            <CardDescription>Choose a Position, Member, and start date</CardDescription>
          </CardHeader>
          <CardContent>
            <CreatePositionAssignmentForm members={state.members} positions={state.positions} />
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Position Holders</CardTitle>
            <CardDescription>Current and historical holders by Position</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {state.positionViews.length ? (
              state.positionViews.map((view) => <PositionHolderSection key={view.position.id} view={view} />)
            ) : (
              <EmptyState label="No Positions" />
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Member Positions</CardTitle>
          <CardDescription>Current and historical Positions by Member</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {state.memberViews.length ? (
            state.memberViews.map((view) => <MemberPositionSection key={view.member.id} view={view} />)
          ) : (
            <EmptyState label="No Members" />
          )}
        </CardContent>
      </Card>
    </main>
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
                  <AssignmentPeriod assignment={assignment} />
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
                  <AssignmentPeriod assignment={assignment} />
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

function AssignmentPeriod({ assignment }: { assignment: PositionAssignmentPeriod }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <CalendarRangeIcon className="size-4 text-muted-foreground" aria-hidden="true" />
      {formatDate(assignment.startsAt)} {assignment.endsAt ? `to ${formatDate(assignment.endsAt)}` : 'onward'}
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

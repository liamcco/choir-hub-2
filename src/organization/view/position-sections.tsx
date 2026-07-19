import { BriefcaseBusinessIcon } from 'lucide-react'
import { EmptyState } from '@/components/assignments/empty-state'
import { Period } from '@/components/assignments/period'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatGroupKind } from '@/organization/group-kind'
import type {
  OrganizationalReadOnlyState,
  ReadOnlyPositionAssignmentPeriod,
  ReadOnlyPositionScope,
  ReadOnlyPositionView,
} from '@/organization/view/service'

export function PositionHistorySection({
  positionViews,
}: {
  positionViews: OrganizationalReadOnlyState['positionViews']
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Positions</CardTitle>
        <CardDescription>Position Scopes and current or historical holders</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {positionViews.length ? (
          positionViews.map((view) => <PositionSection key={view.position.id} view={view} />)
        ) : (
          <EmptyState label="No Positions" />
        )}
      </CardContent>
    </Card>
  )
}

function PositionSection({ view }: { view: ReadOnlyPositionView }) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <BriefcaseBusinessIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="font-medium">{view.position.name}</span>
        <Badge variant="outline">{view.scopeLabel}</Badge>
        {view.position.description ? (
          <span className="text-muted-foreground text-sm">{view.position.description}</span>
        ) : null}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <PositionScopeTable scopes={view.scopes} />
        <HolderTable title="Current Holder" emptyLabel="No current holder" rows={view.currentAssignments} />
        <HolderTable title="Historical Holders" emptyLabel="No historical holders" rows={view.historicalAssignments} />
      </div>
    </section>
  )
}

function PositionScopeTable({ scopes }: { scopes: ReadOnlyPositionScope[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-medium text-sm">Position Scopes</h2>
      {scopes.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group</TableHead>
              <TableHead>Kind</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scopes.map((scope) => (
              <TableRow key={`${scope.positionId}-${scope.groupId}`}>
                <TableCell>{scope.groupPath}</TableCell>
                <TableCell>{formatGroupKind(scope.group.kind)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState label="No Position Scopes" />
      )}
    </div>
  )
}

function HolderTable({
  title,
  emptyLabel,
  rows,
}: {
  title: string
  emptyLabel: string
  rows: ReadOnlyPositionAssignmentPeriod[]
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

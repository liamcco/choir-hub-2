import { BriefcaseBusinessIcon, CalendarRangeIcon, GitForkIcon, KeyRoundIcon, UserRoundIcon } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatGroupKind } from '@/organization/group-kind'
import type {
  OrganizationalReadOnlyState,
  ReadOnlyGroupHierarchyNode,
  ReadOnlyGroupMembershipPeriod,
  ReadOnlyMemberView,
  ReadOnlyPositionAssignmentPeriod,
  ReadOnlyPositionScope,
  ReadOnlyPositionView,
} from '@/organization-read/service'
import type { MemberStatus } from '@/prisma/generated/client'

export function OrganizationalReadOnlyScreen({ state }: { state: OrganizationalReadOnlyState }) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl tracking-normal">Organization</h1>
          <p className="text-muted-foreground text-sm">Groups, Members, Positions, and dated history</p>
        </div>
        <Link href="/account" className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-fit' })}>
          <KeyRoundIcon data-icon="inline-start" />
          Account
        </Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(18rem,24rem)_1fr] xl:items-start">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Group Hierarchy</CardTitle>
            <CardDescription>{state.groups.length} total</CardDescription>
          </CardHeader>
          <CardContent>
            {state.groupHierarchy.length ? (
              <div className="flex flex-col gap-2">
                {state.groupHierarchy.map((node) => (
                  <GroupHierarchyBranch key={node.group.id} node={node} />
                ))}
              </div>
            ) : (
              <EmptyState label="No Groups" />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Current and historical Group Memberships</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {state.memberViews.length ? (
              state.memberViews.map((view) => <MemberSection key={view.member.id} view={view} />)
            ) : (
              <EmptyState label="No Members" />
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Positions</CardTitle>
          <CardDescription>Position Scopes and current or historical holders</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {state.positionViews.length ? (
            state.positionViews.map((view) => <PositionSection key={view.position.id} view={view} />)
          ) : (
            <EmptyState label="No Positions" />
          )}
        </CardContent>
      </Card>
    </main>
  )
}

function GroupHierarchyBranch({ node }: { node: ReadOnlyGroupHierarchyNode }) {
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

function MemberSection({ view }: { view: ReadOnlyMemberView }) {
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

function MembershipTable({
  title,
  emptyLabel,
  rows,
}: {
  title: string
  emptyLabel: string
  rows: ReadOnlyGroupMembershipPeriod[]
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
  rows: ReadOnlyPositionAssignmentPeriod[]
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

function Period({ startsAt, endsAt }: { startsAt: Date; endsAt?: Date | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <CalendarRangeIcon className="size-4 text-muted-foreground" aria-hidden="true" />
      {formatDate(startsAt)} {endsAt ? `to ${formatDate(endsAt)}` : 'onward'}
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

function formatMemberStatus(status: MemberStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}

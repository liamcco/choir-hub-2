import { adminGroupPath, adminPositionPath } from '@/core/navigation/site'
import { formatGroupKind } from '@/features/organization/core/group-kind'
import { formatMemberStatus } from '@/features/organization/core/member-status'
import { RelatedDetailLink } from '@/features/organization/management/components/related-detail-link'
import type {
  CreateMembershipAction,
  EndMembershipAction,
} from '@/features/organization/management/groups/relationships'
import { AddMemberGroupControl, EndGroupMemberControl } from '@/features/organization/management/groups/relationships'
import type {
  CreatePositionAssignmentFormState,
  EndPositionAssignmentFormState,
} from '@/features/organization/management/position-assignments/relationships'
import {
  AssignMemberPositionControl,
  EndPositionAssignmentForm,
} from '@/features/organization/management/position-assignments/relationships'
import type { GroupKind, MemberStatus } from '@/prisma/generated/client'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader } from '@/shared/ui/card'
import { AccountAccessEditor, MemberStatusEditor } from './member-editors'
import type { AccountAccessState } from './service'

export type MemberRelationshipPeriod = {
  id: string
  startsAt: Date
  endsAt?: Date
}

export type MemberMembershipView = MemberRelationshipPeriod & {
  groupId: string
  groupName: string
  groupKind: GroupKind
}

export type MemberAssignmentView = MemberRelationshipPeriod & {
  positionId: string
  positionName: string
  scopeLabel: string
}

export type MemberDetailView = {
  id: string
  name: string
  email: string
  status: MemberStatus
  accessState: AccountAccessState
  accessRole: string
  createdAt: Date
  updatedAt: Date
  groups: { id: string; name: string }[]
  positions: { id: string; label: string }[]
  currentMemberships: MemberMembershipView[]
  historicalMemberships: MemberMembershipView[]
  currentAssignments: MemberAssignmentView[]
  historicalAssignments: MemberAssignmentView[]
}

type MemberDetailActions = {
  createMembership: CreateMembershipAction
  endMembership: EndMembershipAction
  createAssignment: (
    previousState: CreatePositionAssignmentFormState,
    formData: FormData,
  ) => Promise<CreatePositionAssignmentFormState>
  endAssignment: (
    assignmentId: string,
    previousState: EndPositionAssignmentFormState,
    formData: FormData,
  ) => Promise<EndPositionAssignmentFormState>
}

export function MemberDetail({ member, actions }: { member: MemberDetailView; actions?: MemberDetailActions }) {
  const hasHistory = member.historicalMemberships.length > 0 || member.historicalAssignments.length > 0

  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Member</p>
          <h1 className="text-3xl font-semibold tracking-tight">{member.name}</h1>
          <Badge variant="secondary">{formatMemberStatus(member.status)}</Badge>
        </div>
        <MemberStatusEditor memberId={member.id} status={member.status} />
      </header>

      <section aria-labelledby="member-information-heading">
        <h2 className="sr-only" id="member-information-heading">
          Member information
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <ReadField label="Member ID" value={member.id} />
          <ReadField label="Member Status" value={formatMemberStatus(member.status)} />
          <ReadField label="Member since" value={formatDate(member.createdAt)} />
          <ReadField label="Last updated" value={formatDate(member.updatedAt)} />
        </dl>
      </section>

      <section aria-labelledby="group-memberships-heading" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold" id="group-memberships-heading">
            Group Memberships
          </h2>
          {actions ? (
            <AddMemberGroupControl action={actions.createMembership} groups={member.groups} memberId={member.id} />
          ) : null}
        </div>
        <MembershipList
          endAction={actions?.endMembership}
          memberships={member.currentMemberships}
          memberId={member.id}
        />
      </section>

      <section aria-labelledby="position-assignments-heading" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold" id="position-assignments-heading">
            Position Assignments
          </h2>
          {actions ? (
            <AssignMemberPositionControl
              action={actions.createAssignment}
              memberId={member.id}
              positions={member.positions}
            />
          ) : null}
        </div>
        <AssignmentList
          assignments={member.currentAssignments}
          endAction={actions?.endAssignment}
          memberId={member.id}
        />
      </section>

      <AuthUserAccess member={member} />

      {hasHistory ? (
        <details className="rounded-lg border bg-muted/20">
          <summary className="cursor-pointer px-4 py-3 font-medium">History</summary>
          <div className="grid gap-6 border-t p-4 sm:grid-cols-2">
            {member.historicalMemberships.length ? (
              <HistoricalList
                title="Ended Group Memberships"
                items={member.historicalMemberships.map((membership) => ({
                  id: membership.id,
                  title: membership.groupName,
                  detail: formatPeriod(membership),
                }))}
              />
            ) : null}
            {member.historicalAssignments.length ? (
              <HistoricalList
                title="Ended Position Assignments"
                items={member.historicalAssignments.map((assignment) => ({
                  id: assignment.id,
                  title: assignment.positionName,
                  detail: `${assignment.scopeLabel} · ${formatPeriod(assignment)}`,
                }))}
              />
            ) : null}
          </div>
        </details>
      ) : null}
    </article>
  )
}

function AuthUserAccess({ member }: { member: MemberDetailView }) {
  return (
    <Card className="rounded-lg bg-muted/20 shadow-none">
      <CardHeader>
        <h2 className="font-heading text-base leading-snug font-medium">Auth User access</h2>
        <CardDescription>Login identity and global application access</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd>{member.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Access role</dt>
            <dd>{member.accessRole}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Access</dt>
            <dd>{member.accessState === 'enabled' ? 'Enabled' : 'Disabled'}</dd>
          </div>
        </dl>
        <AccountAccessEditor accessState={member.accessState} memberId={member.id} />
      </CardContent>
    </Card>
  )
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}

function MembershipList({
  memberships,
  memberId,
  endAction,
}: {
  memberships: MemberMembershipView[]
  memberId: string
  endAction?: EndMembershipAction
}) {
  return memberships.length ? (
    <ul className="divide-y rounded-lg border">
      {memberships.map((membership) => (
        <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" key={membership.id}>
          <div>
            <RelatedDetailLink href={adminGroupPath(membership.groupId)}>{membership.groupName}</RelatedDetailLink>
            <p className="text-sm text-muted-foreground">
              {formatGroupKind(membership.groupKind)} · Since {formatDate(membership.startsAt)}
            </p>
          </div>
          {endAction ? (
            <EndGroupMemberControl
              action={endAction}
              groupName={membership.groupName}
              membership={{ ...membership, memberId, memberLabel: 'this Member' }}
            />
          ) : null}
        </li>
      ))}
    </ul>
  ) : (
    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No current Group Memberships</p>
  )
}

function AssignmentList({
  assignments,
  memberId,
  endAction,
}: {
  assignments: MemberAssignmentView[]
  memberId: string
  endAction?: MemberDetailActions['endAssignment']
}) {
  return assignments.length ? (
    <ul className="divide-y rounded-lg border">
      {assignments.map((assignment) => (
        <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" key={assignment.id}>
          <div>
            <RelatedDetailLink href={adminPositionPath(assignment.positionId)}>
              {assignment.positionName}
            </RelatedDetailLink>
            <p className="text-sm text-muted-foreground">
              {assignment.scopeLabel} · Since {formatDate(assignment.startsAt)}
            </p>
          </div>
          {endAction ? (
            <EndPositionAssignmentForm
              action={endAction}
              assignment={{
                ...assignment,
                memberId,
                memberLabel: 'this Member',
                position: { name: assignment.positionName },
              }}
            />
          ) : null}
        </li>
      ))}
    </ul>
  ) : (
    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No current Position Assignments</p>
  )
}

function HistoricalList({ title, items }: { title: string; items: { id: string; title: string; detail: string }[] }) {
  return (
    <section className="space-y-2">
      <h3 className="font-medium">{title}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li className="text-sm" key={item.id}>
            <p>{item.title}</p>
            <p className="text-muted-foreground">{item.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date)
}

function formatPeriod(period: MemberRelationshipPeriod) {
  return `${formatDate(period.startsAt)} – ${period.endsAt ? formatDate(period.endsAt) : 'Present'}`
}

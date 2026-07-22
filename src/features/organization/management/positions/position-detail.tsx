import { adminMemberPath } from '@/core/navigation/site'
import type { MemberLabel } from '@/features/organization/core/labels'
import { RelatedDetailLink } from '@/features/organization/management/components/related-detail-link'
import {
  AssignPositionHolderControl,
  EndPositionAssignmentForm,
} from '@/features/organization/management/position-assignments/assignment-form'
import type { Group, Position, PositionAssignment } from '@/prisma/generated/client'
import { PositionFieldEditor } from './position-editors'

export type PositionAssignmentView = PositionAssignment & { memberLabel: string; memberDetail: string }
export type PositionDetailView = {
  position: Position
  groups: Group[]
  scopeGroups: Group[]
  scopeLabel: string
  members: MemberLabel[]
  currentAssignments: PositionAssignmentView[]
  historicalAssignments: PositionAssignmentView[]
}
export function PositionDetail({ position }: { position: PositionDetailView }) {
  const hasHistory = position.historicalAssignments.length > 0
  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Position</p>
          <h1 className="text-3xl font-semibold tracking-tight">{position.position.name}</h1>
        </div>
        <PositionFieldEditor position={position} />
      </header>
      <section aria-labelledby="position-information-heading">
        <h2 className="sr-only" id="position-information-heading">
          Position information
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <ReadField label="Name" value={position.position.name} />
          <ReadField label="Description" value={position.position.description ?? 'No description'} />
          <ReadField label="Group scopes" value={position.scopeLabel} />
        </dl>
      </section>
      <section aria-labelledby="position-assignments-heading" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold" id="position-assignments-heading">
            Current assignment
          </h2>
          <AssignPositionHolderControl members={position.members} positionId={position.position.id} />
        </div>
        {position.currentAssignments.length ? (
          <AssignmentList assignments={position.currentAssignments} showEndControls />
        ) : (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Vacant Position</p>
        )}
      </section>
      {hasHistory ? (
        <details className="rounded-lg border bg-muted/20">
          <summary className="cursor-pointer px-4 py-3 font-medium">History</summary>
          <div className="border-t p-4">
            <h2 className="mb-3 font-medium">Ended Position Assignments</h2>
            <AssignmentList assignments={position.historicalAssignments} />
          </div>
        </details>
      ) : null}
    </article>
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
function AssignmentList({
  assignments,
  showEndControls = false,
}: {
  assignments: PositionAssignmentView[]
  showEndControls?: boolean
}) {
  return (
    <ul className="divide-y rounded-lg border">
      {assignments.map((assignment) => (
        <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" key={assignment.id}>
          <div>
            <RelatedDetailLink href={adminMemberPath(assignment.memberId)}>{assignment.memberLabel}</RelatedDetailLink>
            <p className="text-sm text-muted-foreground">
              {assignment.memberDetail} · Since {formatDate(assignment.startsAt)}
            </p>
          </div>
          {showEndControls ? (
            <EndPositionAssignmentForm
              assignment={{
                id: assignment.id,
                memberId: assignment.memberId,
                startsAt: assignment.startsAt,
                memberLabel: assignment.memberLabel,
                position: { name: 'this Position' },
              }}
            />
          ) : null}
        </li>
      ))}
    </ul>
  )
}
function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date)
}

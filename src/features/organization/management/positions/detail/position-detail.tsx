import { adminUserPath } from '@/core/navigation/site'
import type { Choir, Group, PositionScope, Section } from '@/core/topology'
import type { PositionAssignment } from '@/drizzle/schema'
import type { UserLabel } from '@/features/organization/core/labels'
import { RelatedDetailLink } from '@/features/organization/management/components/related-detail-link'
import {
  AssignPositionHolderControl,
  EndPositionAssignmentForm,
} from '@/features/organization/management/position-assignments/assignment-form'
import { formatDate } from '@/shared/formatting'

export type PositionAssignmentView = PositionAssignment & { userLabel: string; userDetail: string }
export type PositionDetailView = {
  position: { id: string; name: string }
  groups: readonly Group[]
  choirs: readonly Choir[]
  sections: readonly Section[]
  positionScopes: readonly PositionScope[]
  scopeLabel: string
  users: UserLabel[]
  currentAssignments: PositionAssignmentView[]
  historicalAssignments: PositionAssignmentView[]
}
export function PositionDetail({ position }: { position: PositionDetailView }) {
  const currentAssignment = position.currentAssignments[0]
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <section aria-labelledby="position-information-heading">
        <h2 className="sr-only" id="position-information-heading">
          Position information
        </h2>
        <dl className="grid gap-4">
          <ReadField label="Scopes" value={position.scopeLabel} />
        </dl>
      </section>
      <section aria-labelledby="position-assignments-heading" className="space-y-4">
        <h2 className="text-lg font-semibold" id="position-assignments-heading">
          Current assignment
        </h2>
        {currentAssignment ? (
          <AssignmentList assignments={[currentAssignment]} showEndControls />
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Vacant Position</p>
            <AssignPositionHolderControl users={position.users} positionId={position.position.id} />
          </div>
        )}
      </section>
      <section aria-labelledby="previous-holders-heading" className="space-y-4">
        <h2 className="text-lg font-semibold" id="previous-holders-heading">
          Previous holders
        </h2>
        {position.historicalAssignments.length ? (
          <AssignmentList assignments={position.historicalAssignments} />
        ) : (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No previous holders</p>
        )}
      </section>
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
            <RelatedDetailLink href={adminUserPath(assignment.userId)}>{assignment.userLabel}</RelatedDetailLink>
            <p className="text-sm text-muted-foreground">Since {formatDate(assignment.startsAt)}</p>
          </div>
          {showEndControls ? (
            <EndPositionAssignmentForm
              assignment={{
                id: assignment.id,
                userId: assignment.userId,
                startsAt: assignment.startsAt,
                userLabel: assignment.userLabel,
                position: { name: 'this Position' },
              }}
              immediate
            />
          ) : null}
        </li>
      ))}
    </ul>
  )
}

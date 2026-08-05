'use client'

import { useState } from 'react'
import { adminGroupPath, adminPositionPath } from '@/core/navigation/site'
import type { GroupId, PositionId } from '@/core/topology'
import { formatGroupKind } from '@/features/organization/core/group-kind'
import { EndPositionAssignmentForm } from '@/features/organization/management/position-assignments/end-form'
import { formatDate } from '@/shared/formatting'
import type { EntityOption, NamedEntity } from '@/shared/types'
import { Button } from '@/shared/ui/button'
import { RelatedDetailLink } from '../../components/related-detail-link'
import { InlineMemberGroupMembershipForm, InlineMemberPositionAssignmentForm } from './inline-relationship-forms'
import type { MemberAssignmentView, MemberMembershipView } from './member-detail'

export function MemberGroupMembershipSection({
  groups,
  memberships,
  userId,
}: {
  groups: NamedEntity<GroupId>[]
  memberships: MemberMembershipView[]
  userId: string
}) {
  const [isAdding, setIsAdding] = useState(false)

  return (
    <section aria-labelledby="group-memberships-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold" id="group-memberships-heading">
          Committee Memberships
        </h2>
        {!isAdding ? (
          <Button onClick={() => setIsAdding(true)} type="button" variant="outline">
            Add Group
          </Button>
        ) : null}
      </div>
      {memberships.length || isAdding ? (
        <ul className="divide-y rounded-lg border">
          {isAdding ? (
            <InlineMemberGroupMembershipForm groups={groups} userId={userId} onSuccess={() => setIsAdding(false)} />
          ) : null}
          {memberships.map((membership) => (
            <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" key={membership.id}>
              <div>
                <RelatedDetailLink href={adminGroupPath(membership.groupId)}>{membership.groupName}</RelatedDetailLink>
                <p className="text-sm text-muted-foreground">
                  {formatGroupKind(membership.groupKind)} · Since {formatDate(membership.startsAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No current Committee Memberships
        </p>
      )}
    </section>
  )
}

export function MemberPositionAssignmentSection({
  positions,
  assignments,
  userId,
}: {
  positions: EntityOption<PositionId>[]
  assignments: MemberAssignmentView[]
  userId: string
}) {
  const [isAdding, setIsAdding] = useState(false)

  return (
    <section aria-labelledby="position-assignments-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold" id="position-assignments-heading">
          Position Assignments
        </h2>
        {!isAdding ? (
          <Button onClick={() => setIsAdding(true)} type="button" variant="outline">
            Assign Position
          </Button>
        ) : null}
      </div>
      {assignments.length || isAdding ? (
        <ul className="divide-y rounded-lg border">
          {isAdding ? (
            <InlineMemberPositionAssignmentForm
              positions={positions}
              userId={userId}
              onSuccess={() => setIsAdding(false)}
            />
          ) : null}
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

              <EndPositionAssignmentForm
                assignment={{
                  ...assignment,
                  userId,
                  userLabel: 'this User',
                  position: { name: assignment.positionName },
                }}
                immediate
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No current Position Assignments
        </p>
      )}
    </section>
  )
}

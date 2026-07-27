'use client'

import { useActionState, useState } from 'react'
import { adminGroupPath, adminPositionPath } from '@/core/navigation/site'
import { formatGroupKind } from '@/features/organization/core/group-kind'
import type {
  CreateMembershipAction,
  EndMembershipAction,
} from '@/features/organization/management/groups/group-membership-controls'
import { EndGroupMembershipControl } from '@/features/organization/management/groups/group-membership-controls'
import type {
  CreatePositionAssignmentAction,
  EndPositionAssignmentAction,
} from '@/features/organization/management/position-assignments/actions'
import { EndPositionAssignmentForm } from '@/features/organization/management/position-assignments/assignment-form'
import { formatDate } from '@/shared/formatting'
import { FormMessage } from '@/shared/forms/error-handling'
import type { EntityOption, NamedEntity } from '@/shared/types'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'
import { RelatedDetailLink } from '../../components/related-detail-link'
import type { MemberAssignmentView, MemberMembershipView } from './member-detail'

type CreateAssignmentAction = CreatePositionAssignmentAction

export function MemberGroupMembershipSection({
  groups,
  memberships,
  userId,
  action,
  endAction,
}: {
  groups: NamedEntity[]
  memberships: MemberMembershipView[]
  userId: string
  action?: CreateMembershipAction
  endAction?: EndMembershipAction
}) {
  const [isAdding, setIsAdding] = useState(false)

  return (
    <section aria-labelledby="group-memberships-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold" id="group-memberships-heading">
          Committee Memberships
        </h2>
        {action && !isAdding ? (
          <Button onClick={() => setIsAdding(true)} type="button" variant="outline">
            Add Group
          </Button>
        ) : null}
      </div>
      {memberships.length || isAdding ? (
        <ul className="divide-y rounded-lg border">
          {isAdding ? (
            action ? (
              <InlineGroupMembershipForm
                action={action}
                groups={groups}
                userId={userId}
                onSuccess={() => setIsAdding(false)}
              />
            ) : null
          ) : null}
          {memberships.map((membership) => (
            <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" key={membership.id}>
              <div>
                <RelatedDetailLink href={adminGroupPath(membership.groupId)}>{membership.groupName}</RelatedDetailLink>
                <p className="text-sm text-muted-foreground">
                  {formatGroupKind(membership.groupKind)} · Since {formatDate(membership.startsAt)}
                </p>
              </div>
              {endAction ? (
                <EndGroupMembershipControl
                  action={endAction}
                  groupName={membership.groupName}
                  membership={{ ...membership, userId, userLabel: 'this User' }}
                />
              ) : null}
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
  action,
  endAction,
}: {
  positions: EntityOption[]
  assignments: MemberAssignmentView[]
  userId: string
  action?: CreatePositionAssignmentAction
  endAction?: EndPositionAssignmentAction
}) {
  const [isAdding, setIsAdding] = useState(false)

  return (
    <section aria-labelledby="position-assignments-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold" id="position-assignments-heading">
          Position Assignments
        </h2>
        {action && !isAdding ? (
          <Button onClick={() => setIsAdding(true)} type="button" variant="outline">
            Assign Position
          </Button>
        ) : null}
      </div>
      {assignments.length || isAdding ? (
        <ul className="divide-y rounded-lg border">
          {isAdding ? (
            action ? (
              <InlinePositionAssignmentForm
                action={action}
                positions={positions}
                userId={userId}
                onSuccess={() => setIsAdding(false)}
              />
            ) : null
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
              {endAction ? (
                <EndPositionAssignmentForm
                  action={endAction}
                  assignment={{
                    ...assignment,
                    userId,
                    userLabel: 'this User',
                    position: { name: assignment.positionName },
                  }}
                />
              ) : null}
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

function InlineGroupMembershipForm({
  groups,
  userId,
  action,
  onSuccess,
}: {
  groups: NamedEntity[]
  userId: string
  action: CreateMembershipAction
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(action, {})

  return (
    <li className="p-4">
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <input name="userId" type="hidden" value={userId} />
        <Field className="min-w-0 flex-1">
          <FieldLabel htmlFor={`user-${userId}-inline-group`}>Group</FieldLabel>
          <NativeSelect
            aria-invalid={!!state.fieldErrors?.groupId}
            className="w-full"
            id={`user-${userId}-inline-group`}
            name="groupId"
            required
          >
            <NativeSelectOption value="">Choose Group</NativeSelectOption>
            {groups.map((group) => (
              <NativeSelectOption key={group.id} value={group.id}>
                {group.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{state.fieldErrors?.groupId}</FieldError>
        </Field>
        <div className="flex shrink-0 gap-2">
          <Button onClick={onSuccess} type="button" variant="ghost">
            Cancel
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending ? 'Adding…' : 'Confirm'}
          </Button>
        </div>
        <FormMessage onSuccess={onSuccess} state={state} />
      </form>
    </li>
  )
}

function InlinePositionAssignmentForm({
  positions,
  userId,
  action,
  onSuccess,
}: {
  positions: EntityOption[]
  userId: string
  action: CreateAssignmentAction
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(action, {})

  return (
    <li className="p-4">
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <input name="userId" type="hidden" value={userId} />
        <Field className="min-w-0 flex-1">
          <FieldLabel htmlFor={`user-${userId}-inline-position`}>Position</FieldLabel>
          <NativeSelect
            aria-invalid={!!state.fieldErrors?.positionId}
            className="w-full"
            id={`user-${userId}-inline-position`}
            name="positionId"
            required
          >
            <NativeSelectOption value="">Choose Position</NativeSelectOption>
            {positions.map((position) => (
              <NativeSelectOption key={position.id} value={position.id}>
                {position.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{state.fieldErrors?.positionId}</FieldError>
        </Field>
        <div className="flex shrink-0 gap-2">
          <Button onClick={onSuccess} type="button" variant="ghost">
            Cancel
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending ? 'Assigning…' : 'Confirm'}
          </Button>
        </div>
        <FormMessage onSuccess={onSuccess} state={state} />
      </form>
    </li>
  )
}

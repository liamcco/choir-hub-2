'use client'

import { useActionState, useState } from 'react'
import { adminUserPath } from '@/core/navigation/site'
import type { UserDisplayOption } from '@/features/organization/core/labels'
import { UserCombobox } from '@/features/organization/management/components/user-combobox'
import type {
  CreateMembershipAction,
  EndMembershipAction,
} from '@/features/organization/management/groups/group-membership-controls'
import { EndGroupMembershipControl } from '@/features/organization/management/groups/group-membership-controls'
import { formatPeriod } from '@/shared/formatting'
import { FormMessage } from '@/shared/forms/error-handling'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { RelatedDetailLink } from '../../components/related-detail-link'
import type { GroupMembershipView } from './group-detail'

export function GroupMembersSection({
  action,
  endAction,
  groupId,
  groupKind,
  groupName,
  memberships,
  users,
}: {
  action: CreateMembershipAction
  endAction: EndMembershipAction
  groupId: string
  groupKind: 'committee' | 'board'
  groupName: string
  memberships: GroupMembershipView[]
  users: UserDisplayOption[]
}) {
  const [isAdding, setIsAdding] = useState(false)

  return (
    <section aria-labelledby="group-memberships-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold" id="group-memberships-heading">
          Members ({new Set(memberships.map((membership) => membership.userId)).size})
        </h2>
        {groupKind === 'committee' && !isAdding ? (
          <Button onClick={() => setIsAdding(true)} type="button" variant="outline">
            Add User
          </Button>
        ) : null}
      </div>
      {memberships.length || isAdding ? (
        <ul className="divide-y rounded-lg border">
          {isAdding ? (
            <InlineGroupMembershipForm
              action={action}
              groupId={groupId}
              users={users}
              onSuccess={() => setIsAdding(false)}
            />
          ) : null}
          {memberships.map((membership) => (
            <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" key={membership.id}>
              <div>
                <RelatedDetailLink href={adminUserPath(membership.userId)}>{membership.userLabel}</RelatedDetailLink>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatPeriod(membership)}</span>
                  {membership.sourceLabels.map((sourceLabel) => (
                    <Badge key={sourceLabel} variant="secondary">
                      {sourceLabel}
                    </Badge>
                  ))}
                </div>
              </div>
              {groupKind === 'committee' ? (
                <EndGroupMembershipControl action={endAction} groupName={groupName} membership={membership} />
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No current effective members
        </p>
      )}
    </section>
  )
}

function InlineGroupMembershipForm({
  action,
  groupId,
  users,
  onSuccess,
}: {
  action: CreateMembershipAction
  groupId: string
  users: UserDisplayOption[]
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(action, {})

  return (
    <li className="p-4">
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <input name="groupId" type="hidden" value={groupId} />
        <Field className="min-w-0 flex-1">
          <FieldLabel htmlFor={`group-${groupId}-user`}>User</FieldLabel>
          <UserCombobox
            id={`group-${groupId}-user`}
            invalid={!!state.fieldErrors?.userId}
            name="userId"
            users={users}
          />
          <FieldError>{state.fieldErrors?.userId}</FieldError>
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

'use client'

import { useState } from 'react'
import { adminUserPath } from '@/core/navigation/site'
import type { UserDisplayOption } from '@/features/organization/core/labels'
import { EndGroupMembershipControl } from '@/features/organization/management/groups/group-membership-controls'
import { formatPeriod } from '@/shared/formatting'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { RelatedDetailLink } from '../../components/related-detail-link'
import type { GroupMembershipView } from './group-detail'
import { InlineGroupMembershipForm } from './inline-group-membership-form'

export function GroupMembersSection({
  groupId,
  groupKind,
  groupName,
  memberships,
  users,
}: {
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
                <EndGroupMembershipControl groupName={groupName} membership={membership} />
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

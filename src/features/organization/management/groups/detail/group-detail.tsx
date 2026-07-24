import { adminUserPath } from '@/core/navigation/site'
import type { Group } from '@/drizzle/schema'
import { formatGroupKind } from '@/features/organization/core/group-kind'
import type { UserLabel } from '@/features/organization/core/labels'
import { RelatedDetailLink } from '@/features/organization/management/components/related-detail-link'
import { formatPeriod } from '@/shared/formatting'
import { Badge } from '@/shared/ui/badge'
import {
  type CreateMembershipAction,
  EndGroupUserControl,
  type EndMembershipAction,
} from '../group-membership-controls'
import { GroupMembersSection } from './group-members-section'

export type GroupMembershipView = {
  id: string
  groupId: string
  userId: string
  userLabel: string
  userDetail: string
  startsAt: Date
  endsAt: Date | null
  sourceLabels: string[]
}

export type GroupDetailView = Group & {
  users: UserLabel[]
  currentMemberships: GroupMembershipView[]
  scheduledMemberships: GroupMembershipView[]
  historicalMemberships: GroupMembershipView[]
}

export type GroupDetailActions = {
  createMembership: CreateMembershipAction
  endMembership: EndMembershipAction
}

export function GroupDetail({ group, actions }: { group: GroupDetailView; actions: GroupDetailActions }) {
  return (
    <article className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <section aria-labelledby="group-information-heading">
        <h2 className="sr-only" id="group-information-heading">
          Group information
        </h2>
        <dl className="grid gap-4">
          <ReadField label="Kind" value={formatGroupKind(group.kind)} />
        </dl>
      </section>

      <GroupMembersSection
        action={actions.createMembership}
        endAction={actions.endMembership}
        groupId={group.id}
        groupKind={group.kind}
        groupName={group.name}
        memberships={group.currentMemberships}
        users={group.users}
      />

      <section aria-labelledby="previous-group-members-heading" className="space-y-3">
        <h2 className="text-lg font-semibold" id="previous-group-members-heading">
          Previous members
        </h2>
        <MembershipList
          emptyText="No previous members"
          groupName={group.name}
          memberships={group.historicalMemberships}
        />
      </section>

      {group.scheduledMemberships.length ? (
        <section aria-labelledby="scheduled-group-memberships-heading" className="space-y-3">
          <h2 className="text-lg font-semibold" id="scheduled-group-memberships-heading">
            Scheduled Group Memberships
          </h2>
          <MembershipList
            endAction={actions.endMembership}
            groupName={group.name}
            memberships={group.scheduledMemberships}
            showEndControls
          />
        </section>
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

function MembershipList({
  memberships,
  groupName,
  emptyText,
  showEndControls = false,
  endAction,
}: {
  memberships: GroupMembershipView[]
  groupName: string
  emptyText?: string
  showEndControls?: boolean
  endAction?: EndMembershipAction
}) {
  if (!memberships.length) {
    return emptyText ? (
      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{emptyText}</p>
    ) : null
  }

  return (
    <ul className="divide-y rounded-lg border">
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
          {showEndControls && endAction ? (
            <EndGroupUserControl action={endAction} groupName={groupName} membership={membership} />
          ) : null}
        </li>
      ))}
    </ul>
  )
}

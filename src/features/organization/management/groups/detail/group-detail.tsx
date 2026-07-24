import { adminUserPath } from '@/core/navigation/site'
import type { Group } from '@/drizzle/schema'
import type { UserLabel } from '@/features/organization/core/labels'
import { RelatedDetailLink } from '@/features/organization/management/components/related-detail-link'
import { formatPeriod } from '@/shared/formatting'
import { Badge } from '@/shared/ui/badge'
import {
  AddGroupUserControl,
  type CreateMembershipAction,
  EndGroupUserControl,
  type EndMembershipAction,
} from '../group-membership-controls'

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
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Group</p>
          <h1 className="text-3xl font-semibold tracking-tight">{group.name}</h1>
        </div>
      </header>

      <section aria-labelledby="group-information-heading">
        <h2 className="sr-only" id="group-information-heading">
          Group information
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <ReadField label="Name" value={group.name} />
        </dl>
      </section>

      <section aria-labelledby="group-memberships-heading" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold" id="group-memberships-heading">
            Effective members
          </h2>
          {group.kind === 'committee' ? (
            <AddGroupUserControl action={actions.createMembership} groupId={group.id} users={group.users} />
          ) : null}
        </div>
        <MembershipList
          emptyText="No current effective members"
          groupName={group.name}
          memberships={group.currentMemberships}
          showEndControls={group.kind === 'committee'}
          endAction={actions.endMembership}
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

      {group.historicalMemberships.length ? (
        <details className="rounded-lg border bg-muted/20">
          <summary className="cursor-pointer px-4 py-3 font-medium">History</summary>
          <div className="border-t p-4">
            <h2 className="mb-3 font-medium">Ended Group Memberships</h2>
            <MembershipList groupName={group.name} memberships={group.historicalMemberships} />
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
              <span>{membership.userDetail}</span>
              <span aria-hidden="true">·</span>
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

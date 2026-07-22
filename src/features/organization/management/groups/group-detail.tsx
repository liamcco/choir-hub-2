import { adminMemberPath } from '@/core/navigation/site'
import { formatGroupKind } from '@/features/organization/core/group-kind'
import type { MemberLabel } from '@/features/organization/core/labels'
import { RelatedDetailLink } from '@/features/organization/management/components/related-detail-link'
import type { Group } from '@/prisma/generated/client'
import { Badge } from '@/shared/ui/badge'
import { GroupFieldEditor } from './group-editors'
import type { GroupFormAction } from './group-form'
import {
  AddGroupMemberControl,
  type CreateMembershipAction,
  EndGroupMemberControl,
  type EndMembershipAction,
} from './group-membership-controls'

export type GroupMembershipView = {
  id: string
  groupId: string
  memberId: string
  memberLabel: string
  memberDetail: string
  startsAt: Date
  endsAt: Date | null
}

export type GroupDetailView = Group & {
  parentName: string | null
  groups: Group[]
  members: MemberLabel[]
  currentMemberships: GroupMembershipView[]
  scheduledMemberships: GroupMembershipView[]
  historicalMemberships: GroupMembershipView[]
}

export type GroupDetailActions = {
  updateGroup: GroupFormAction
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
          <Badge variant="secondary">{formatGroupKind(group.kind)}</Badge>
        </div>
        <GroupFieldEditor action={actions.updateGroup} group={group} groups={group.groups} />
      </header>

      <section aria-labelledby="group-information-heading">
        <h2 className="sr-only" id="group-information-heading">
          Group information
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <ReadField label="Name" value={group.name} />
          <ReadField label="Group Kind" value={formatGroupKind(group.kind)} />
          <ReadField label="Parent Group" value={group.parentName ?? 'No parent Group'} />
          <ReadField label="Description" value={group.description ?? 'No description'} />
        </dl>
      </section>

      <section aria-labelledby="group-memberships-heading" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold" id="group-memberships-heading">
            Group Memberships
          </h2>
          <AddGroupMemberControl action={actions.createMembership} groupId={group.id} members={group.members} />
        </div>
        <MembershipList
          emptyText="No current Group Memberships"
          groupName={group.name}
          memberships={group.currentMemberships}
          showEndControls
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
            <RelatedDetailLink href={adminMemberPath(membership.memberId)}>{membership.memberLabel}</RelatedDetailLink>
            <p className="text-sm text-muted-foreground">
              {membership.memberDetail} · {formatPeriod(membership)}
            </p>
          </div>
          {showEndControls && endAction ? (
            <EndGroupMemberControl action={endAction} groupName={groupName} membership={membership} />
          ) : null}
        </li>
      ))}
    </ul>
  )
}

// TODO: Move this to a shared utility file for formatting dates and periods
function formatPeriod(period: Pick<GroupMembershipView, 'startsAt' | 'endsAt'>) {
  return `${formatDate(period.startsAt)} – ${period.endsAt ? formatDate(period.endsAt) : 'Present'}`
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date)
}

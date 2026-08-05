import type { GroupId, GroupKind } from '@/core/topology'
import { formatGroupKind } from '@/features/organization/core/group-kind'
import type { UserDisplayOption } from '@/features/organization/core/labels'
import { GroupMembersSection } from './group-members-section'

export type GroupMembershipView = {
  id: string
  groupId: GroupId
  userId: string
  userLabel: string
  userDetail: string
  startsAt: Date
  endsAt: Date | null
  sourceLabels: string[]
}

export type GroupDetailView = {
  id: GroupId
  name: string
  kind: GroupKind
  users: UserDisplayOption[]
  currentMemberships: GroupMembershipView[]
}

export function GroupDetail({ group }: { group: GroupDetailView }) {
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
        groupId={group.id}
        groupKind={group.kind}
        groupName={group.name}
        memberships={group.currentMemberships}
        users={group.users}
      />
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

import type { GroupKind } from '@/core/topology'
import type { MemberStatus } from '@/drizzle/schema'
import { formatMemberStatus } from '@/features/organization/core/member-status'
import type {
  CreateMembershipAction,
  EndMembershipAction,
} from '@/features/organization/management/groups/relationships'
import type {
  CreatePositionAssignmentFormState,
  EndPositionAssignmentFormState,
} from '@/features/organization/management/position-assignments/relationships'
import { Badge } from '@/shared/ui/badge'
import { MemberGroupMembershipSection, MemberPositionAssignmentSection } from './member-relationship-sections'

export type MemberRelationshipPeriod = {
  id: string
  startsAt: Date
  endsAt?: Date
}

export type MemberMembershipView = MemberRelationshipPeriod & {
  groupId: string
  groupName: string
  groupKind: GroupKind
}

export type MemberAssignmentView = MemberRelationshipPeriod & {
  positionId: string
  positionName: string
  scopeLabel: string
}

export type MemberDetailView = {
  id: string
  name: string
  email: string
  status: MemberStatus
  homePlacement?: { choir: { id: string; name: string } | null; section: { id: string; name: string } | null }
  groups: { id: string; name: string }[]
  positions: { id: string; label: string }[]
  currentMemberships: MemberMembershipView[]
  currentAssignments: MemberAssignmentView[]
}

type MemberDetailActions = {
  createMembership: CreateMembershipAction
  endMembership: EndMembershipAction
  createAssignment: (
    previousState: CreatePositionAssignmentFormState,
    formData: FormData,
  ) => Promise<CreatePositionAssignmentFormState>
  endAssignment: (
    assignmentId: string,
    previousState: EndPositionAssignmentFormState,
    formData: FormData,
  ) => Promise<EndPositionAssignmentFormState>
}

export function MemberDetail({ member, actions }: { member: MemberDetailView; actions?: MemberDetailActions }) {
  return (
    <article className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <section aria-labelledby="user-information-heading" className="max-w-2xl space-y-5 border-b pb-6">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-2xl font-semibold" id="user-information-heading">
            {member.name}
          </h1>
          <Badge className={memberStatusClassName(member.status)}>{formatMemberStatus(member.status)}</Badge>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <ReadField label="Home Choir" value={member.homePlacement?.choir?.name ?? 'No Home Choir'} />
              <ReadField label="Section" value={member.homePlacement?.section?.name ?? 'No Section'} />
            </dl>
          </div>
          <div>
            <dl className="text-sm">
              <ReadField label="Email" value={member.email} />
            </dl>
          </div>
        </div>
      </section>

      <MemberGroupMembershipSection
        action={actions?.createMembership}
        endAction={actions?.endMembership}
        groups={member.groups}
        memberships={member.currentMemberships}
        userId={member.id}
      />

      <MemberPositionAssignmentSection
        action={actions?.createAssignment}
        assignments={member.currentAssignments}
        endAction={actions?.endAssignment}
        positions={member.positions}
        userId={member.id}
      />
    </article>
  )
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function memberStatusClassName(status: MemberStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'PASSIVE':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    case 'FORMER':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

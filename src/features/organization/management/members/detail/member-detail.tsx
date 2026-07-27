import type { GroupKind } from '@/core/topology'
import type { MemberStatus } from '@/drizzle/schema'
import type { DatedPeriod } from '@/features/organization/core/dated-history'
import { formatMemberStatus } from '@/features/organization/core/member-status'
import type {
  CreateMembershipAction,
  EndMembershipAction,
} from '@/features/organization/management/groups/group-membership-controls'
import type {
  CreatePositionAssignmentAction,
  EndPositionAssignmentAction,
} from '@/features/organization/management/position-assignments/actions'
import type { EntityOption, NamedEntity } from '@/shared/types'
import { Badge } from '@/shared/ui/badge'
import { ImpersonateUserButton } from './impersonate-user-button'
import { MemberGroupMembershipSection, MemberPositionAssignmentSection } from './member-relationship-sections'
import { ResendInvitationControl } from './resend-invitation-control'

export type MemberRelationshipPeriod = DatedPeriod & { id: string }

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
  emailVerified?: boolean
  isAdmin?: boolean
  status: MemberStatus
  homePlacement?: { choir: { id: string; name: string } | null; section: { id: string; name: string } | null }
  groups: NamedEntity[]
  positions: EntityOption[]
  currentMemberships: MemberMembershipView[]
  currentAssignments: MemberAssignmentView[]
}

type MemberDetailActions = {
  resendInvitation?: (userId: string) => Promise<{ success: boolean; message: string }>
  createMembership: CreateMembershipAction
  endMembership: EndMembershipAction
  createAssignment: CreatePositionAssignmentAction
  endAssignment: EndPositionAssignmentAction
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
        {!member.emailVerified && actions?.resendInvitation && (
          <ResendInvitationControl action={actions.resendInvitation} userId={member.id} />
        )}
        {!member.isAdmin ? <ImpersonateUserButton userId={member.id} userName={member.name} /> : null}
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

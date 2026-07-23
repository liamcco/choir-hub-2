import { connection } from 'next/server'
import { Suspense } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { CollectionFrame } from '@/features/organization/management/components/collection-frame'
import { InvalidDetailLookup } from '@/features/organization/management/components/invalid-detail-lookup'
import { PageHeaderActions } from '@/features/organization/management/components/page-header-action'
import {
  createGroupMembershipAction,
  endGroupMembershipAction,
} from '@/features/organization/management/group-memberships'
import { MemberCollection } from '@/features/organization/management/members/member-collection'
import { MemberCreateDialog } from '@/features/organization/management/members/member-create-dialog'
import { MemberDetail } from '@/features/organization/management/members/member-detail'
import { MemberDetailRoutePresentation } from '@/features/organization/management/members/member-detail-presentation'
import { memberManagementQuery } from '@/features/organization/management/members/query'
import {
  createPositionAssignmentAction,
  endPositionAssignmentAction,
} from '@/features/organization/management/position-assignments'

// TODO: Look at Suspense...
export function MemberManagementScreen({ detailId }: { detailId?: string }) {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted-foreground">Loading Members…</p>}>
      <MemberCollectionScreen detailId={detailId} />
    </Suspense>
  )
}

async function MemberCollectionScreen({ detailId }: { detailId?: string }) {
  await connection()
  const members = await memberManagementQuery.listCollection()
  return (
    <>
      <CollectionFrame
        activeResource="members"
        title="Members"
        description="Browse choir Members and their current organizational place."
        actions={
          <PageHeaderActions>
            <MemberCreateDialog />
          </PageHeaderActions>
        }
      >
        <MemberCollection members={members} />
      </CollectionFrame>
      {detailId ? <MemberDetailOverlay memberId={detailId} /> : null}
    </>
  )
}

async function MemberDetailOverlay({ memberId }: { memberId: string }) {
  const member = await memberManagementQuery.getDetail(memberId)
  if (!member) return <InvalidDetailLookup collectionPath={ROUTES.adminMembers} resourceName="Member" />

  return (
    <MemberDetailRoutePresentation name={member.name}>
      <MemberDetail actions={memberDetailActions} member={member} />
    </MemberDetailRoutePresentation>
  )
}

// TODO what da hell
const memberDetailActions = {
  createMembership: createGroupMembershipAction,
  endMembership: endGroupMembershipAction,
  createAssignment: createPositionAssignmentAction,
  endAssignment: endPositionAssignmentAction,
}

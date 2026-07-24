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
import { MemberCollection as UserCollection } from '@/features/organization/management/members/collection/member-collection'
import { MemberCreateDialog as UserCreateDialog } from '@/features/organization/management/members/create/member-create-dialog'
import { MemberDetail as UserDetail } from '@/features/organization/management/members/detail/member-detail'
import { MemberDetailRoutePresentation as UserDetailRoutePresentation } from '@/features/organization/management/members/detail/member-detail-presentation'
import { getMemberDetail, listMemberCollection } from '@/features/organization/management/members/query'
import {
  createPositionAssignmentAction,
  endPositionAssignmentAction,
} from '@/features/organization/management/position-assignments'

// TODO: Look at Suspense...
export function UserManagementScreen({ detailId }: { detailId?: string }) {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted-foreground">Loading Users…</p>}>
      <UserCollectionScreen detailId={detailId} />
    </Suspense>
  )
}

async function UserCollectionScreen({ detailId }: { detailId?: string }) {
  await connection()
  const users = await listMemberCollection()
  return (
    <>
      <CollectionFrame
        activeResource="users"
        title="Users"
        description="Browse Users and their current organizational place."
        actions={
          <PageHeaderActions>
            <UserCreateDialog />
          </PageHeaderActions>
        }
      >
        <UserCollection users={users} />
      </CollectionFrame>
      {detailId ? <UserDetailOverlay userId={detailId} /> : null}
    </>
  )
}

async function UserDetailOverlay({ userId }: { userId: string }) {
  const user = await getMemberDetail(userId)
  if (!user) return <InvalidDetailLookup collectionPath={ROUTES.adminUsers} resourceName="User" />

  return (
    <UserDetailRoutePresentation name={user.name}>
      <UserDetail actions={userDetailActions} member={user} />
    </UserDetailRoutePresentation>
  )
}

// TODO what da hell
const userDetailActions = {
  createMembership: createGroupMembershipAction,
  endMembership: endGroupMembershipAction,
  createAssignment: createPositionAssignmentAction,
  endAssignment: endPositionAssignmentAction,
}

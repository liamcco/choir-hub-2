import { connection } from 'next/server'
import { Suspense } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { AdminCollectionSkeleton } from '@/features/organization/management/components/admin-collection-skeleton'
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
import { MemberDetailSkeleton as UserDetailSkeleton } from '@/features/organization/management/members/detail/member-detail-skeleton'
import { getMemberDetail, listMemberCollection } from '@/features/organization/management/members/query'
import {
  createPositionAssignmentAction,
  endPositionAssignmentAction,
} from '@/features/organization/management/position-assignments'

// TODO: Look at Suspense...
export function UserManagementScreen({ detailId }: { detailId?: string }) {
  return (
    <>
      <Suspense fallback={<AdminCollectionSkeleton columnCount={4} title="Users" />}>
        <UserCollectionScreen />
      </Suspense>
      {detailId ? <UserDetailOverlay userId={detailId} /> : null}
    </>
  )
}

async function UserCollectionScreen() {
  await connection()
  const users = await listMemberCollection()
  return (
    <CollectionFrame
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
  )
}

function UserDetailOverlay({ userId }: { userId: string }) {
  const detailPromise = getMemberDetail(userId)

  return (
    <UserDetailRoutePresentation
      title={
        <Suspense fallback="User">
          <UserDetailTitle detailPromise={detailPromise} />
        </Suspense>
      }
    >
      <Suspense fallback={<UserDetailSkeleton />}>
        <UserDetailContent detailPromise={detailPromise} />
      </Suspense>
    </UserDetailRoutePresentation>
  )
}

async function UserDetailTitle({ detailPromise }: { detailPromise: ReturnType<typeof getMemberDetail> }) {
  const user = await detailPromise
  return user?.name ?? 'User'
}

async function UserDetailContent({ detailPromise }: { detailPromise: ReturnType<typeof getMemberDetail> }) {
  const user = await detailPromise
  if (!user) return <InvalidDetailLookup collectionPath={ROUTES.adminUsers} resourceName="User" />

  return <UserDetail actions={userDetailActions} member={user} />
}

// TODO what da hell
const userDetailActions = {
  createMembership: createGroupMembershipAction,
  endMembership: endGroupMembershipAction,
  createAssignment: createPositionAssignmentAction,
  endAssignment: endPositionAssignmentAction,
}

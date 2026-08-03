import { Suspense } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { AdminCollectionTableSkeleton } from '@/features/organization/management/components/admin-collection-skeleton'
import { CollectionFrame } from '@/features/organization/management/components/collection-frame'
import { InvalidDetailLookup } from '@/features/organization/management/components/invalid-detail-lookup'
import { PageHeaderActions } from '@/features/organization/management/components/page-header-action'
import { MemberCollection as UserCollection } from '@/features/organization/management/members/collection/member-collection'
import { MemberCreateDialog as UserCreateDialog } from '@/features/organization/management/members/create/member-create-dialog'
import { MemberDetail as UserDetail } from '@/features/organization/management/members/detail/member-detail'
import { MemberDetailRoutePresentation as UserDetailRoutePresentation } from '@/features/organization/management/members/detail/member-detail-presentation'
import { MemberDetailSkeleton as UserDetailSkeleton } from '@/features/organization/management/members/detail/member-detail-skeleton'
import { MemberImportDialog as UserImportDialog } from '@/features/organization/management/members/import/import-dialog'
import { getUserDetail, listUserCollection } from '@/features/organization/management/members/query'
import type { DetailSearchParams } from '../search-params'
import { resendInvitationAction } from './onboarding/actions'

export function UserManagementScreen({ searchParams }: { searchParams: DetailSearchParams }) {
  return (
    <>
      <CollectionFrame
        title="Users"
        description="Browse Users and their current organizational place."
        actions={
          <PageHeaderActions>
            <UserImportDialog />
            <UserCreateDialog />
          </PageHeaderActions>
        }
      >
        <Suspense fallback={<AdminCollectionTableSkeleton columnCount={4} title="Users" />}>
          <UserCollectionTable />
        </Suspense>
      </CollectionFrame>
      <Suspense fallback={null}>
        <UserDetailRoute searchParams={searchParams} />
      </Suspense>
    </>
  )
}

async function UserCollectionTable() {
  const users = await listUserCollection()
  return <UserCollection users={users} />
}

async function UserDetailRoute({ searchParams }: { searchParams: DetailSearchParams }) {
  const detail = (await searchParams).detail
  const detailId = typeof detail === 'string' ? detail : undefined
  return detailId ? <UserDetailOverlay userId={detailId} /> : null
}

function UserDetailOverlay({ userId }: { userId: string }) {
  const detailPromise = getUserDetail(userId)

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

async function UserDetailTitle({ detailPromise }: { detailPromise: ReturnType<typeof getUserDetail> }) {
  const user = await detailPromise
  return user?.name ?? 'User'
}

async function UserDetailContent({ detailPromise }: { detailPromise: ReturnType<typeof getUserDetail> }) {
  const user = await detailPromise
  if (!user) return <InvalidDetailLookup collectionPath={ROUTES.adminUsers} resourceName="User" />

  return <UserDetail actions={userDetailActions} member={user} />
}

const userDetailActions = {
  resendInvitation: resendInvitationAction,
}

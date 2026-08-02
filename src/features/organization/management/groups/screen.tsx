import { Suspense } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { AdminCollectionTableSkeleton } from '@/features/organization/management/components/admin-collection-skeleton'
import { CollectionFrame } from '@/features/organization/management/components/collection-frame'
import { InvalidDetailLookup } from '@/features/organization/management/components/invalid-detail-lookup'
import type { DetailSearchParams } from '../search-params'
import { GroupCollection } from './collection/group-collection'
import { GroupDetail } from './detail/group-detail'
import { GroupDetailDialog } from './detail/group-detail-presentation'
import { GroupDetailSkeleton } from './detail/group-detail-skeleton'

import { getGroupDetail, listGroupCollection } from './query'

export function GroupManagementScreen({ searchParams }: { searchParams: DetailSearchParams }) {
  return (
    <>
      <CollectionFrame
        title="Groups"
        description="Browse organizational Groups and their current direct Members."
        actions={null}
      >
        <Suspense fallback={<AdminCollectionTableSkeleton columnCount={2} title="Groups" />}>
          <GroupCollectionTable />
        </Suspense>
      </CollectionFrame>
      <Suspense fallback={null}>
        <GroupDetailRoute searchParams={searchParams} />
      </Suspense>
    </>
  )
}

async function GroupCollectionTable() {
  const groups = await listGroupCollection()
  return <GroupCollection groups={groups} />
}

async function GroupDetailRoute({ searchParams }: { searchParams: DetailSearchParams }) {
  const detail = (await searchParams).detail
  const detailId = typeof detail === 'string' ? detail : undefined
  return detailId ? <GroupDetailOverlay groupId={detailId} /> : null
}

function GroupDetailOverlay({ groupId }: { groupId: string }) {
  const detailPromise = getGroupDetail(groupId)

  return (
    <GroupDetailDialog
      title={
        <Suspense fallback="Group">
          <GroupDetailTitle detailPromise={detailPromise} />
        </Suspense>
      }
    >
      <Suspense fallback={<GroupDetailSkeleton />}>
        <GroupDetailContent detailPromise={detailPromise} />
      </Suspense>
    </GroupDetailDialog>
  )
}

async function GroupDetailTitle({ detailPromise }: { detailPromise: ReturnType<typeof getGroupDetail> }) {
  const group = await detailPromise
  return group?.name ?? 'Group'
}

async function GroupDetailContent({ detailPromise }: { detailPromise: ReturnType<typeof getGroupDetail> }) {
  const group = await detailPromise
  if (!group) return <InvalidDetailLookup collectionPath={ROUTES.adminGroups} resourceName="Group" />

  return <GroupDetail group={group} />
}

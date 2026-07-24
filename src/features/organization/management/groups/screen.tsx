import { connection } from 'next/server'
import { Suspense } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { AdminCollectionSkeleton } from '@/features/organization/management/components/admin-collection-skeleton'
import { InvalidDetailLookup } from '@/features/organization/management/components/invalid-detail-lookup'
import {
  createGroupMembershipAction,
  endGroupMembershipAction,
} from '@/features/organization/management/group-memberships/actions'
import { GroupCollectionScreen as GroupCollection } from './collection/group-collection-screen'
import { GroupDetail } from './detail/group-detail'
import { GroupDetailDialog } from './detail/group-detail-presentation'
import { GroupDetailSkeleton } from './detail/group-detail-skeleton'

// TODO: naming query vs service. The query is for reading data, the service is for writing data.
// But the naming is inconsistent and confusing.
import { getGroupDetail, listGroupCollection } from './query'

// TODO: Look at the Suspenses...
export function GroupManagementScreen({ detailId }: { detailId?: string }) {
  return (
    <>
      <Suspense fallback={<AdminCollectionSkeleton columnCount={2} title="Groups" />}>
        <GroupCollectionScreen />
      </Suspense>
      {detailId ? <GroupDetailOverlay groupId={detailId} /> : null}
    </>
  )
}

// TODO: What da hell
async function GroupCollectionScreen() {
  await connection()
  const groups = await listGroupCollection()
  return <GroupCollection groups={groups} />
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

  return (
    <GroupDetail
      actions={{ createMembership: createGroupMembershipAction, endMembership: endGroupMembershipAction }}
      group={group}
    />
  )
}

import { connection } from 'next/server'
import { Suspense } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { InvalidDetailLookup } from '@/features/organization/management/components/invalid-detail-lookup'
import {
  createGroupMembershipAction,
  endGroupMembershipAction,
} from '@/features/organization/management/group-memberships/actions'
import { updateGroupAction } from './actions'
import { GroupCollectionScreen as GroupCollection } from './collection/group-collection-screen'
import { GroupDetail } from './detail/group-detail'
import { GroupDetailDialog } from './detail/group-detail-presentation'

// TODO: naming query vs service. The query is for reading data, the service is for writing data.
// But the naming is inconsistent and confusing.
import { getGroupDetail, listGroupCollection } from './query'
import { listGroups } from './service'

// TODO: Look at the Suspenses...
export function GroupManagementScreen({ detailId }: { detailId?: string }) {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted-foreground">Loading Groups…</p>}>
      <GroupCollectionScreen detailId={detailId} />
    </Suspense>
  )
}

// TODO: What da hell
function groupDetailActions(groupId: string) {
  return {
    updateGroup: updateGroupAction.bind(null, groupId),
    createMembership: createGroupMembershipAction,
    endMembership: endGroupMembershipAction,
  }
}

async function GroupCollectionScreen({ detailId }: { detailId?: string }) {
  await connection()
  const [groups, createGroups] = await Promise.all([listGroupCollection(), listGroups()])
  return (
    <>
      <GroupCollection createGroups={createGroups} groups={groups} />
      {detailId ? <GroupDetailOverlay groupId={detailId} /> : null}
    </>
  )
}

async function GroupDetailOverlay({ groupId }: { groupId: string }) {
  const group = await getGroupDetail(groupId)
  if (!group) return <InvalidDetailLookup collectionPath={ROUTES.adminGroups} resourceName="Group" />

  return (
    <GroupDetailDialog name={group.name}>
      <GroupDetail actions={groupDetailActions(group.id)} group={group} />
    </GroupDetailDialog>
  )
}

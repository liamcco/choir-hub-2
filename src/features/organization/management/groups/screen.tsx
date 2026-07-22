import { connection } from 'next/server'
import { Suspense } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { InvalidDetail } from '@/features/organization/management/components/invalid-detail'
import {
  createGroupMembershipAction,
  endGroupMembershipAction,
} from '@/features/organization/management/group-memberships/actions'
import { updateGroupAction } from './actions'
import { GroupCollectionScreen as GroupCollection } from './group-collection-screen'
import { GroupDetail } from './group-detail'
import { GroupDetailDialog } from './group-detail-presentation'
import { groupManagementQuery } from './query'
import { listGroups } from './service'

export function GroupManagementScreen({ detailId }: { detailId?: string }) {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted-foreground">Loading Groups…</p>}>
      <GroupCollectionScreen detailId={detailId} />
    </Suspense>
  )
}

function groupDetailActions(groupId: string) {
  return {
    updateGroup: updateGroupAction.bind(null, groupId),
    createMembership: createGroupMembershipAction,
    endMembership: endGroupMembershipAction,
  }
}

async function GroupCollectionScreen({ detailId }: { detailId?: string }) {
  await connection()
  const [groups, createGroups] = await Promise.all([groupManagementQuery.listCollection(), listGroups()])
  return (
    <>
      <GroupCollection createGroups={createGroups} groups={groups} />
      {detailId ? <GroupDetailOverlay groupId={detailId} /> : null}
    </>
  )
}

async function GroupDetailOverlay({ groupId }: { groupId: string }) {
  const group = await groupManagementQuery.getDetail(groupId)
  if (!group) return <InvalidDetail collectionPath={ROUTES.adminGroups} resourceName="Group" />

  return (
    <GroupDetailDialog name={group.name}>
      <GroupDetail actions={groupDetailActions(group.id)} group={group} />
    </GroupDetailDialog>
  )
}

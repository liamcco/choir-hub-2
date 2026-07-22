import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import {
  createGroupMembershipAction,
  endGroupMembershipAction,
} from '@/features/organization/management/group-memberships/actions'
import { createGroupAction, updateGroupAction } from './actions'
import { GroupCollectionScreen as GroupCollection } from './group-collection-screen'
import { GroupCreate } from './group-create'
import { GroupDetail } from './group-detail'
import { GroupDetailRoutePresentation } from './group-detail-presentation'
import { groupManagementQuery } from './query'
import { listGroups } from './service'

export function GroupManagementScreen() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted-foreground">Loading Groups…</p>}>
      <GroupCollectionScreen />
    </Suspense>
  )
}

export function GroupCreateScreen({ presentation }: { presentation: 'standalone' | 'intercepted' }) {
  return (
    <Suspense fallback={<p className="py-12 text-center text-muted-foreground">Loading Group form…</p>}>
      <GroupCreateContent presentation={presentation} />
    </Suspense>
  )
}

async function GroupCreateContent({ presentation }: { presentation: 'standalone' | 'intercepted' }) {
  await connection()
  const groups = await listGroups()
  return <GroupCreate action={createGroupAction} groups={groups} showHeading={presentation === 'standalone'} />
}

function GroupDetailScreen({ groupId }: { groupId: string }) {
  return (
    <Suspense fallback={<p className="py-12 text-center text-muted-foreground">Loading Group…</p>}>
      <GroupDetailContent groupId={groupId} />
    </Suspense>
  )
}

export function StandaloneGroupDetailScreen({ groupId }: { groupId: string }) {
  return (
    <GroupDetailRoutePresentation presentation="standalone">
      <GroupDetailScreen groupId={groupId} />
    </GroupDetailRoutePresentation>
  )
}

async function GroupDetailContent({ groupId }: { groupId: string }) {
  const group = await loadGroupDetail(groupId)
  return <GroupDetail actions={groupDetailActions(group.id)} group={group} />
}

export function InterceptedGroupDetailScreen({ groupId }: { groupId: string }) {
  return (
    <Suspense fallback={null}>
      <InterceptedGroupDetailContent groupId={groupId} />
    </Suspense>
  )
}

async function InterceptedGroupDetailContent({ groupId }: { groupId: string }) {
  const group = await loadGroupDetail(groupId)
  return (
    <GroupDetailRoutePresentation name={group.name} presentation="intercepted">
      <GroupDetail actions={groupDetailActions(group.id)} group={group} />
    </GroupDetailRoutePresentation>
  )
}

function groupDetailActions(groupId: string) {
  return {
    updateGroup: updateGroupAction.bind(null, groupId),
    createMembership: createGroupMembershipAction,
    endMembership: endGroupMembershipAction,
  }
}

async function loadGroupDetail(groupId: string) {
  await connection()
  const group = await groupManagementQuery.getDetail(groupId)
  if (!group) notFound()
  return group
}

async function GroupCollectionScreen() {
  await connection()
  const groups = await groupManagementQuery.listCollection()
  return <GroupCollection groups={groups} />
}

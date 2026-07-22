import { StandaloneGroupDetailScreen } from '@/features/organization/management'

export default function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  return <GroupDetailFromParams params={params} />
}

async function GroupDetailFromParams({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  return <StandaloneGroupDetailScreen groupId={groupId} />
}

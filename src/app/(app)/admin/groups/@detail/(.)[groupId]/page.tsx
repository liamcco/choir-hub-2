import { InterceptedGroupDetailScreen } from '@/features/organization/management'

export default async function InterceptedGroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  return <InterceptedGroupDetailScreen groupId={groupId} />
}

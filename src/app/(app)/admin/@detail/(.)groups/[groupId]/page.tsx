import { InterceptedGroupDetailScreen } from '@/features/organization/management'
export default async function InterceptedGroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  return <InterceptedGroupDetailScreen groupId={(await params).groupId} />
}

import { InterceptedMemberDetailScreen } from '@/features/organization/management'

export default async function InterceptedMemberDetailPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params
  return <InterceptedMemberDetailScreen memberId={memberId} />
}

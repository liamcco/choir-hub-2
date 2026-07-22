import { InterceptedMemberDetailScreen } from '@/features/organization/management'
export default async function InterceptedMemberDetailPage({ params }: { params: Promise<{ memberId: string }> }) {
  return <InterceptedMemberDetailScreen memberId={(await params).memberId} />
}

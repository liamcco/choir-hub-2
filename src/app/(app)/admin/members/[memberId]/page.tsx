import { StandaloneMemberDetailScreen } from '@/features/organization/management'

export default function MemberDetailPage({ params }: { params: Promise<{ memberId: string }> }) {
  return <MemberDetailFromParams params={params} />
}

async function MemberDetailFromParams({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params
  return <StandaloneMemberDetailScreen memberId={memberId} />
}

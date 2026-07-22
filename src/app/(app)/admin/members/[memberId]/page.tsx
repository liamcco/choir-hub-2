import { Suspense } from 'react'
import { StandaloneMemberDetailScreen } from '@/features/organization/management'

export default function MemberDetailPage({ params }: { params: Promise<{ memberId: string }> }) {
  return (
    <Suspense fallback={<p className="py-12 text-center text-muted-foreground">Loading Member…</p>}>
      <MemberDetailFromParams params={params} />
    </Suspense>
  )
}

async function MemberDetailFromParams({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params
  return <StandaloneMemberDetailScreen memberId={memberId} />
}

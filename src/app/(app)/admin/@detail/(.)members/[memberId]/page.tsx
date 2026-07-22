import { Suspense } from 'react'
import { InterceptedMemberDetailScreen } from '@/features/organization/management'

export const instant = false

export default function InterceptedMemberDetailPage({ params }: { params: Promise<{ memberId: string }> }) {
  return (
    <Suspense fallback={<p className="py-12 text-center text-muted-foreground">Loading Member…</p>}>
      <InterceptedMemberDetailContent params={params} />
    </Suspense>
  )
}

async function InterceptedMemberDetailContent({ params }: { params: Promise<{ memberId: string }> }) {
  return <InterceptedMemberDetailScreen memberId={(await params).memberId} />
}

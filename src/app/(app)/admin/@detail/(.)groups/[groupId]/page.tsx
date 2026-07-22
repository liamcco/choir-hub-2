import { Suspense } from 'react'
import { InterceptedGroupDetailScreen } from '@/features/organization/management'

export const instant = false

export default function InterceptedGroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  return (
    <Suspense fallback={<p className="py-12 text-center text-muted-foreground">Loading Group…</p>}>
      <InterceptedGroupDetailContent params={params} />
    </Suspense>
  )
}

async function InterceptedGroupDetailContent({ params }: { params: Promise<{ groupId: string }> }) {
  return <InterceptedGroupDetailScreen groupId={(await params).groupId} />
}

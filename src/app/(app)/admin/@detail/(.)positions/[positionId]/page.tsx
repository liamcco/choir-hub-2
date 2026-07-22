import { Suspense } from 'react'
import { InterceptedPositionDetailScreen } from '@/features/organization/management'

export const instant = false

export default function InterceptedPositionDetailPage({ params }: { params: Promise<{ positionId: string }> }) {
  return (
    <Suspense fallback={<p className="py-12 text-center text-muted-foreground">Loading Position…</p>}>
      <InterceptedPositionDetailContent params={params} />
    </Suspense>
  )
}

async function InterceptedPositionDetailContent({ params }: { params: Promise<{ positionId: string }> }) {
  return <InterceptedPositionDetailScreen positionId={(await params).positionId} />
}

import { Suspense } from 'react'
import { StandalonePositionDetailScreen } from '@/features/organization/management'

export default function PositionDetailPage({ params }: { params: Promise<{ positionId: string }> }) {
  return (
    <Suspense fallback={<p className="py-12 text-center text-muted-foreground">Loading Position…</p>}>
      <PositionDetailFromParams params={params} />
    </Suspense>
  )
}

async function PositionDetailFromParams({ params }: { params: Promise<{ positionId: string }> }) {
  const { positionId } = await params
  return <StandalonePositionDetailScreen positionId={positionId} />
}

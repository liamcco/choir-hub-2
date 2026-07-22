import { InterceptedPositionDetailScreen } from '@/features/organization/management'
export default async function InterceptedPositionDetailPage({ params }: { params: Promise<{ positionId: string }> }) {
  const { positionId } = await params
  return <InterceptedPositionDetailScreen positionId={positionId} />
}

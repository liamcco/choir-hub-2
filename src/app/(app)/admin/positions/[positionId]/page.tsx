import { StandalonePositionDetailScreen } from '@/features/organization/management'
export default async function PositionDetailPage({ params }: { params: Promise<{ positionId: string }> }) {
  const { positionId } = await params
  return <StandalonePositionDetailScreen positionId={positionId} />
}

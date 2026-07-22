import { InterceptedPositionDetailScreen } from '@/features/organization/management'
export default async function InterceptedPositionDetailPage({ params }: { params: Promise<{ positionId: string }> }) {
  return <InterceptedPositionDetailScreen positionId={(await params).positionId} />
}

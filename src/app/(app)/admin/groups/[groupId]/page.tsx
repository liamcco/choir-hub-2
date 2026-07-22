import { Suspense } from 'react'
import { StandaloneGroupDetailScreen } from '@/features/organization/management'

export default function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  return (
    <Suspense fallback={<p className="py-12 text-center text-muted-foreground">Loading Group…</p>}>
      <GroupDetailFromParams params={params} />
    </Suspense>
  )
}

async function GroupDetailFromParams({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  return <StandaloneGroupDetailScreen groupId={groupId} />
}

import { connection } from 'next/server'
import { Suspense } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { AdminCollectionSkeleton } from '@/features/organization/management/components/admin-collection-skeleton'
import { CollectionFrame } from '@/features/organization/management/components/collection-frame'
import { InvalidDetailLookup } from '@/features/organization/management/components/invalid-detail-lookup'
import { PositionCollection } from './collection/position-collection'
import { PositionDetail } from './detail/position-detail'
import { PositionDetailRoutePresentation } from './detail/position-detail-presentation'
import { PositionDetailSkeleton } from './detail/position-detail-skeleton'
import { getPositionDetail, listPositionCollection } from './query'

// TODO: Look at suspense...
export function PositionManagementScreen({ detailId }: { detailId?: string }) {
  return (
    <>
      <Suspense fallback={<AdminCollectionSkeleton columnCount={4} title="Positions" />}>
        <PositionCollectionScreen />
      </Suspense>
      {detailId ? <PositionDetailOverlay positionId={detailId} /> : null}
    </>
  )
}

async function PositionCollectionScreen() {
  await connection()
  const positions = await listPositionCollection()
  return (
    <CollectionFrame
      title="Positions"
      description="Browse choir Positions, their Group scopes, and current holders."
      actions={null}
    >
      <PositionCollection positions={positions} />
    </CollectionFrame>
  )
}

function PositionDetailOverlay({ positionId }: { positionId: string }) {
  const detailPromise = getPositionDetail(positionId)

  return (
    <PositionDetailRoutePresentation
      title={
        <Suspense fallback="Position">
          <PositionDetailTitle detailPromise={detailPromise} />
        </Suspense>
      }
    >
      <Suspense fallback={<PositionDetailSkeleton />}>
        <PositionDetailContent detailPromise={detailPromise} />
      </Suspense>
    </PositionDetailRoutePresentation>
  )
}

async function PositionDetailTitle({ detailPromise }: { detailPromise: ReturnType<typeof getPositionDetail> }) {
  const position = await detailPromise
  return position?.position.name ?? 'Position'
}

async function PositionDetailContent({ detailPromise }: { detailPromise: ReturnType<typeof getPositionDetail> }) {
  const position = await detailPromise
  if (!position) return <InvalidDetailLookup collectionPath={ROUTES.adminPositions} resourceName="Position" />

  return <PositionDetail position={position} />
}

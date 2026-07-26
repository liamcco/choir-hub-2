import { connection } from 'next/server'
import { Suspense } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { AdminCollectionTableSkeleton } from '@/features/organization/management/components/admin-collection-skeleton'
import { CollectionFrame } from '@/features/organization/management/components/collection-frame'
import { InvalidDetailLookup } from '@/features/organization/management/components/invalid-detail-lookup'
import { PositionCollection } from './collection/position-collection'
import { PositionDetail } from './detail/position-detail'
import { PositionDetailRoutePresentation } from './detail/position-detail-presentation'
import { PositionDetailSkeleton } from './detail/position-detail-skeleton'
import { getPositionDetail, listPositionCollection } from './query'

type DetailSearchParams = Promise<{ detail?: string | string[] }>

export function PositionManagementScreen({ searchParams }: { searchParams: DetailSearchParams }) {
  return (
    <>
      <CollectionFrame
        title="Positions"
        description="Browse choir Positions, their Group scopes, and current holders."
        actions={null}
      >
        <Suspense fallback={<AdminCollectionTableSkeleton columnCount={4} title="Positions" />}>
          <PositionCollectionTable />
        </Suspense>
      </CollectionFrame>
      <Suspense fallback={null}>
        <PositionDetailRoute searchParams={searchParams} />
      </Suspense>
    </>
  )
}

async function PositionCollectionTable() {
  await connection()
  const positions = await listPositionCollection()
  return <PositionCollection positions={positions} />
}

async function PositionDetailRoute({ searchParams }: { searchParams: DetailSearchParams }) {
  const detail = (await searchParams).detail
  const detailId = typeof detail === 'string' ? detail : undefined
  return detailId ? <PositionDetailOverlay positionId={detailId} /> : null
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

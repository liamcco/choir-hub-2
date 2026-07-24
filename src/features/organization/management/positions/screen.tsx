import { connection } from 'next/server'
import { Suspense } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { CollectionFrame } from '@/features/organization/management/components/collection-frame'
import { InvalidDetailLookup } from '@/features/organization/management/components/invalid-detail-lookup'
import { PageHeaderActions } from '@/features/organization/management/components/page-header-action'
import { PositionCollection } from './collection/position-collection'
import { PositionCreate } from './create/position-create'
import { PositionCreateDialog } from './create/position-create-dialog'
import { PositionDetail } from './detail/position-detail'
import { PositionDetailRoutePresentation } from './detail/position-detail-presentation'
import { getPositionDetail, getPositionDetailForCreate, listPositionCollection } from './query'

// TODO: Look at suspense...
export function PositionManagementScreen({ detailId }: { detailId?: string }) {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted-foreground">Loading Positions…</p>}>
      <PositionCollectionScreen detailId={detailId} />
    </Suspense>
  )
}

async function PositionCollectionScreen({ detailId }: { detailId?: string }) {
  await connection()
  const [positions, createState] = await Promise.all([listPositionCollection(), getPositionDetailForCreate()])
  return (
    <>
      <CollectionFrame
        activeResource="positions"
        title="Positions"
        description="Browse choir Positions, their Group scopes, and current holders."
        actions={
          <PageHeaderActions>
            <PositionCreateDialog groups={createState.groups} />
          </PageHeaderActions>
        }
      >
        <PositionCollection positions={positions} />
      </CollectionFrame>
      {detailId ? <PositionDetailOverlay positionId={detailId} /> : null}
    </>
  )
}

async function PositionDetailOverlay({ positionId }: { positionId: string }) {
  const position = await getPositionDetail(positionId)
  if (!position) return <InvalidDetailLookup collectionPath={ROUTES.adminPositions} resourceName="Position" />

  return (
    <PositionDetailRoutePresentation name={position.position.name}>
      <PositionDetail position={position} />
    </PositionDetailRoutePresentation>
  )
}

export function PositionCreateScreen() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-muted-foreground">Loading Position form…</p>}>
      <PositionCreateContent />
    </Suspense>
  )
}
async function PositionCreateContent() {
  await connection()
  const position = await getPositionDetailForCreate()
  return <PositionCreate groups={position.groups} />
}

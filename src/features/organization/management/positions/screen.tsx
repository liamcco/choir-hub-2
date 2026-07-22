import { PlusIcon } from 'lucide-react'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { CollectionFrame } from '@/features/organization/management/components/collection-frame'
import { PageHeaderAction, PageHeaderActions } from '@/features/organization/management/components/page-header-action'
import { PositionCollection } from './position-collection'
import { PositionCreate } from './position-create'
import { PositionDetail } from './position-detail'
import { PositionDetailRoutePresentation } from './position-detail-presentation'
import { positionManagementQuery } from './query'

export function PositionManagementScreen() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted-foreground">Loading Positions…</p>}>
      <PositionCollectionScreen />
    </Suspense>
  )
}

async function PositionCollectionScreen() {
  await connection()
  const positions = await positionManagementQuery.listCollection()
  return (
    <CollectionFrame
      activeResource="positions"
      title="Positions"
      description="Browse choir Positions, their Group scopes, and current holders."
      actions={
        <PageHeaderActions>
          <PageHeaderAction href={ROUTES.adminPositionCreate}>
            <PlusIcon data-icon="inline-start" />
            Create Position
          </PageHeaderAction>
        </PageHeaderActions>
      }
    >
      <PositionCollection positions={positions} />
    </CollectionFrame>
  )
}

export function PositionCreateScreen({ presentation }: { presentation: 'standalone' | 'intercepted' }) {
  return (
    <Suspense fallback={<p className="py-12 text-center text-muted-foreground">Loading Position form…</p>}>
      <PositionCreateContent presentation={presentation} />
    </Suspense>
  )
}
async function PositionCreateContent({ presentation }: { presentation: 'standalone' | 'intercepted' }) {
  await connection()
  const position = await positionManagementQuery.getDetailForCreate()
  return <PositionCreate groups={position.groups} showHeading={presentation === 'standalone'} />
}

function PositionDetailScreen({ positionId }: { positionId: string }) {
  return (
    <Suspense fallback={<p className="py-12 text-center text-muted-foreground">Loading Position…</p>}>
      <PositionDetailContent positionId={positionId} />
    </Suspense>
  )
}
async function PositionDetailContent({ positionId }: { positionId: string }) {
  const position = await loadPositionDetail(positionId)
  return <PositionDetail position={position} />
}
export function StandalonePositionDetailScreen({ positionId }: { positionId: string }) {
  return (
    <PositionDetailRoutePresentation presentation="standalone">
      <PositionDetailScreen positionId={positionId} />
    </PositionDetailRoutePresentation>
  )
}
export function InterceptedPositionDetailScreen({ positionId }: { positionId: string }) {
  return (
    <Suspense fallback={null}>
      <InterceptedPositionDetailContent positionId={positionId} />
    </Suspense>
  )
}
async function InterceptedPositionDetailContent({ positionId }: { positionId: string }) {
  const position = await loadPositionDetail(positionId)
  return (
    <PositionDetailRoutePresentation name={position.position.name} presentation="intercepted">
      <PositionDetail position={position} />
    </PositionDetailRoutePresentation>
  )
}
async function loadPositionDetail(positionId: string) {
  await connection()
  const position = await positionManagementQuery.getDetail(positionId)
  if (!position) notFound()
  return position
}

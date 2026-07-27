import { Suspense } from 'react'
import { CollectionFrame } from '@/features/organization/management/components/collection-frame'
import { filterPlacementUsers, placementCounts } from './model'
import { PlacementNavigation } from './navigation'
import { PlacementOverlay } from './overlay'
import { getPlacementDetail, listPlacementUsers, placementLabels } from './query'
import { PlacementRoster } from './roster'
import { PlacementSearch } from './search'
import { PlacementSkeleton } from './skeleton'

export function PlacementManagementScreen({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <CollectionFrame title="Placement" description="Manage Member Status, Home Choir, and Section Placement.">
      <Suspense fallback={<PlacementSkeleton />}>
        <PlacementContent searchParams={searchParams} />
      </Suspense>
    </CollectionFrame>
  )
}

async function PlacementContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const area = typeof params.area === 'string' ? params.area : undefined
  const section = typeof params.section === 'string' ? params.section : undefined
  const detail = typeof params.detail === 'string' ? params.detail : undefined
  const users = await listPlacementUsers()
  const { choirs, sections } = placementLabels()
  const activeCounts = placementCounts(users)
  const selectedUsers = filterPlacementUsers(users, area, section)
  const rosterQuery = new URLSearchParams()
  if (area) rosterQuery.set('area', area)
  if (section) rosterQuery.set('section', section)
  const userDetail = detail ? await getPlacementDetail(detail) : null
  return (
    <>
      <div className="space-y-8">
        <PlacementSearch users={users} />
        <PlacementNavigation
          choirs={choirs}
          sections={sections}
          selected={area}
          selectedSection={section}
          counts={activeCounts}
        />
        <div className="border-t pt-8">
          <PlacementRoster users={selectedUsers} query={rosterQuery.toString()} />
        </div>
      </div>
      {detail ? <PlacementOverlay detail={userDetail} /> : null}
    </>
  )
}

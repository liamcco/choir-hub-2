import { CollectionFrame } from '@/features/organization/management/components/collection-frame'
import { PlacementSkeleton } from '@/features/organization/management/placement/skeleton'

export default function AdminPlacementLoading() {
  return (
    <CollectionFrame title="Placement" description="Manage Member Status, Home Choir, and Section Placement.">
      <PlacementSkeleton />
    </CollectionFrame>
  )
}

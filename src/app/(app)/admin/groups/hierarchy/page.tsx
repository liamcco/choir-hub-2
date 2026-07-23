import { Suspense } from 'react'
import { GroupHierarchyScreen } from '@/features/organization/management/groups'

export default function AdminGroupHierarchyPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted-foreground">Loading Group Hierarchy…</p>}>
      <GroupHierarchyScreen />
    </Suspense>
  )
}

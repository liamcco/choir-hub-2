import { CollectionFrame } from '@/features/organization/management/components/collection-frame'
import { GroupCollection, type GroupCollectionRow } from './group-collection'

export function GroupCollectionScreen({ groups }: { groups: GroupCollectionRow[] }) {
  return (
    <CollectionFrame
      title="Groups"
      description="Browse organizational Groups and their current direct Members."
      actions={null}
    >
      <GroupCollection groups={groups} />
    </CollectionFrame>
  )
}

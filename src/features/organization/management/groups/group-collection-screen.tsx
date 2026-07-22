import { GitForkIcon, PlusIcon } from 'lucide-react'
import { ROUTES } from '@/core/navigation/site'
import { CollectionFrame } from '@/features/organization/management/components/collection-frame'
import { PageHeaderAction, PageHeaderActions } from '@/features/organization/management/components/page-header-action'
import { buttonVariants } from '@/shared/ui/button'
import { GroupCollection, type GroupCollectionRow } from './group-collection'

export function GroupCollectionScreen({ groups }: { groups: GroupCollectionRow[] }) {
  return (
    <CollectionFrame
      activeResource="groups"
      title="Groups"
      description="Browse organizational Groups and their current direct Members."
      actions={
        <PageHeaderActions>
          <PageHeaderAction
            className={buttonVariants({ size: 'lg', variant: 'outline' })}
            href={ROUTES.adminGroupHierarchy}
          >
            <GitForkIcon data-icon="inline-start" />
            View hierarchy
          </PageHeaderAction>
          <PageHeaderAction href={ROUTES.adminGroupCreate}>
            <PlusIcon data-icon="inline-start" />
            Create Group
          </PageHeaderAction>
        </PageHeaderActions>
      }
    >
      <GroupCollection groups={groups} />
    </CollectionFrame>
  )
}

import { GitForkIcon } from 'lucide-react'
import { ROUTES } from '@/core/navigation/site'
import { CollectionFrame } from '@/features/organization/management/components/collection-frame'
import { PageHeaderAction, PageHeaderActions } from '@/features/organization/management/components/page-header-action'
import type { Group } from '@/prisma/generated/client'
import { buttonVariants } from '@/shared/ui/button'
import { GroupCollection, type GroupCollectionRow } from './group-collection'
import { GroupCreateDialog } from './group-create-dialog'

export function GroupCollectionScreen({
  groups,
  createGroups,
}: {
  groups: GroupCollectionRow[]
  createGroups: Group[]
}) {
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
          <GroupCreateDialog groups={createGroups} />
        </PageHeaderActions>
      }
    >
      <GroupCollection groups={groups} />
    </CollectionFrame>
  )
}

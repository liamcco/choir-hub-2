import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { connection } from 'next/server'
import { ROUTES } from '@/core/navigation/site'
import { CollectionFrame } from '@/features/organization/management/components/collection-frame'
import { buttonVariants } from '@/shared/ui/button'
import { GroupHierarchy } from './group-hierarchy'
import { groupManagementQuery } from './query'

export async function GroupHierarchyScreen() {
  // TODO: When is await connection() necessary? It seems to be required for the query to work, but I don't understand why.
  await connection()
  const groups = await groupManagementQuery.getHierarchy()
  return (
    <CollectionFrame
      activeResource="groups"
      title="Group hierarchy"
      description="View every Group and its deduplicated current Members across each subtree."
      actions={
        <Link className={buttonVariants({ size: 'lg', variant: 'outline' })} href={ROUTES.adminGroups}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back to Groups
        </Link>
      }
    >
      <GroupHierarchy groups={groups} />
    </CollectionFrame>
  )
}

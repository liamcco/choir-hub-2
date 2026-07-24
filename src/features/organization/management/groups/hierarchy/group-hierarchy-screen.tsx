import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { connection } from 'next/server'
import { ROUTES } from '@/core/navigation/site'
import { CollectionFrame } from '@/features/organization/management/components/collection-frame'
import { buttonVariants } from '@/shared/ui/button'
import { getGroupHierarchy } from '../query'
import { GroupHierarchy } from './group-hierarchy'

export async function GroupHierarchyScreen() {
  await connection()
  const groups = await getGroupHierarchy()
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

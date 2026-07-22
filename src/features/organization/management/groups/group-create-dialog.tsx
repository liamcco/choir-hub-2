'use client'

import { PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { adminGroupPath } from '@/core/navigation/site'
import { CollectionDialog } from '@/features/organization/management/components/collection-dialog'
import type { Group } from '@/prisma/generated/client'
import { Button } from '@/shared/ui/button'
import { createGroupAction } from './actions'
import { CreateGroupForm } from './group-form'

export function GroupCreateDialog({ groups }: { groups: Group[] }) {
  const router = useRouter()
  return (
    <CollectionDialog
      title="Create Group"
      description="Add a durable organizational Group."
      contentLabel="Create Group form"
      trigger={(open) => (
        <Button onClick={open} size="lg" type="button">
          <PlusIcon data-icon="inline-start" />
          Create Group
        </Button>
      )}
    >
      {(close) => (
        <CreateGroupForm
          action={createGroupAction}
          groups={groups}
          onCreated={(groupId) => router.push(adminGroupPath(groupId), { scroll: false })}
          onSuccess={close}
        />
      )}
    </CollectionDialog>
  )
}

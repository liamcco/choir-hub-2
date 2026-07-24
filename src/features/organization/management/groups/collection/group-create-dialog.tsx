'use client'

import { PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { adminGroupPath } from '@/core/navigation/site'
import { ControlledDialog } from '@/features/organization/management/components/controlled-dialog'
import type { Group } from '@/prisma/generated/client'
import { Button } from '@/shared/ui/button'
import { createGroupAction } from '../actions'
import { CreateGroupForm } from '../detail/group-form'

export function GroupCreateDialog({ groups }: { groups: Group[] }) {
  const router = useRouter()
  return (
    <ControlledDialog
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
      {(closeDialog) => (
        <CreateGroupForm
          action={createGroupAction}
          groups={groups}
          onCreated={(groupId) => router.push(adminGroupPath(groupId), { scroll: false })}
          onSuccess={closeDialog}
        />
      )}
    </ControlledDialog>
  )
}

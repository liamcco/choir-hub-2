'use client'

import { PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { adminPositionPath } from '@/core/navigation/site'
import { CollectionDialog } from '@/features/organization/management/components/collection-dialog'
import { Button } from '@/shared/ui/button'
import { CreatePositionForm } from './position-form'
import type { PositionManagementState } from './service'

export function PositionCreateDialog({ groups }: { groups: PositionManagementState['groups'] }) {
  const router = useRouter()
  return (
    <CollectionDialog
      title="Create Position"
      description="Add a durable choir Position and its Group scopes."
      contentLabel="Create Position form"
      trigger={(open) => (
        <Button onClick={open} size="lg" type="button">
          <PlusIcon data-icon="inline-start" />
          Create Position
        </Button>
      )}
    >
      {(close) => (
        <CreatePositionForm
          groups={groups}
          onCreated={(positionId) => router.push(adminPositionPath(positionId), { scroll: false })}
          onSuccess={close}
        />
      )}
    </CollectionDialog>
  )
}

'use client'

import { PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { adminPositionPath } from '@/core/navigation/site'
import { ControlledDialog } from '@/features/organization/management/components/controlled-dialog'
import { Button } from '@/shared/ui/button'
import type { PositionManagementState } from '../service'
import { CreatePositionForm } from './position-form'

export function PositionCreateDialog({ groups }: { groups: PositionManagementState['groups'] }) {
  const router = useRouter()
  return (
    <ControlledDialog
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
      {(closeDialog) => (
        <CreatePositionForm
          groups={groups}
          onCreated={(positionId) => router.push(adminPositionPath(positionId), { scroll: false })}
          onSuccess={closeDialog}
        />
      )}
    </ControlledDialog>
  )
}

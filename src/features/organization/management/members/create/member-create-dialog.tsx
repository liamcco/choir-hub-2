'use client'

import { PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { adminUserPath } from '@/core/navigation/site'
import { ControlledDialog } from '@/features/organization/management/components/controlled-dialog'
import { Button } from '@/shared/ui/button'
import { MemberAccountForm } from './member-account-form'

export function MemberCreateDialog() {
  const router = useRouter()
  return (
    <ControlledDialog
      title="Create User"
      description="Create a User and set their initial Member Status."
      contentLabel="Create User form"
      trigger={(open) => (
        <Button onClick={open} size="lg" type="button">
          <PlusIcon data-icon="inline-start" />
          Create User
        </Button>
      )}
    >
      {(closeDialog) => (
        <MemberAccountForm
          onCreated={(userId) => router.push(adminUserPath(userId), { scroll: false })}
          onSuccess={closeDialog}
        />
      )}
    </ControlledDialog>
  )
}

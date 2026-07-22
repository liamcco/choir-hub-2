'use client'

import { PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { adminMemberPath } from '@/core/navigation/site'
import { ControlledDialog } from '@/features/organization/management/components/controlled-dialog'
import { Button } from '@/shared/ui/button'
import { MemberAccountForm } from './member-account-form'

export function MemberCreateDialog() {
  const router = useRouter()
  return (
    <ControlledDialog
      title="Create Member"
      description="Create an Auth User and its linked skeletal Member together."
      contentLabel="Create Member form"
      trigger={(open) => (
        <Button onClick={open} size="lg" type="button">
          <PlusIcon data-icon="inline-start" />
          Create Member
        </Button>
      )}
    >
      {(closeDialog) => (
        <MemberAccountForm
          onCreated={(memberId) => router.push(adminMemberPath(memberId), { scroll: false })}
          onSuccess={closeDialog}
        />
      )}
    </ControlledDialog>
  )
}

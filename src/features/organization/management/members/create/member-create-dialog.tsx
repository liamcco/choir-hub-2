'use client'

import { PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { adminUserPath } from '@/core/navigation/site'
import { AdminDialog } from '@/features/organization/management/components/admin-dialog'
import { Button } from '@/shared/ui/button'
import { MemberAccountForm } from './member-account-form'

export function MemberCreateDialog() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="lg" type="button">
        <PlusIcon data-icon="inline-start" />
        Create User
      </Button>
      {isOpen ? (
        <AdminDialog
          className="sm:bottom-auto sm:h-auto sm:max-h-[min(52rem,calc(100dvh-3rem))] sm:max-w-md"
          contentLabel="Create User form"
          onClose={() => setIsOpen(false)}
          title="Create User"
        >
          <MemberAccountForm
            onCreated={(userId) => router.push(adminUserPath(userId), { scroll: false })}
            onSuccess={() => setIsOpen(false)}
          />
        </AdminDialog>
      ) : null}
    </>
  )
}

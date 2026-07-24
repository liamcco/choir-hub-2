'use client'

import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { AdminDialog } from '@/features/organization/management/components/admin-dialog'

export function GroupDetailDialog({ title = 'Group', children }: { title?: ReactNode; children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <AdminDialog
      className="sm:bottom-auto sm:h-auto sm:max-h-[min(52rem,calc(100dvh-3rem))] sm:max-w-md"
      contentLabel="Group detail content"
      description="Group detail"
      onClose={() => router.replace(pathname, { scroll: false })}
      title={title}
    >
      {children}
    </AdminDialog>
  )
}

'use client'

import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { AdminDialog } from '@/features/organization/management/components/admin-dialog'

export function MemberDetailDialog({ title = 'User', children }: { title?: ReactNode; children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <AdminDialog
      className="sm:max-w-xl"
      contentLabel="User detail content"
      description="User detail"
      onClose={() => router.replace(pathname, { scroll: false })}
      title={title}
    >
      {children}
    </AdminDialog>
  )
}

export function MemberDetailRoutePresentation({
  title = 'User',
  children,
}: {
  title?: ReactNode
  children: ReactNode
}) {
  return <MemberDetailDialog title={title}>{children}</MemberDetailDialog>
}

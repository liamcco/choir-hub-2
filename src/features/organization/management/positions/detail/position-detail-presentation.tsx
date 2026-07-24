'use client'

import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { AdminDialog } from '@/features/organization/management/components/admin-dialog'

export function PositionDetailDialog({ title = 'Position', children }: { title?: ReactNode; children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <AdminDialog
      className="sm:h-auto sm:max-h-[min(52rem,calc(100dvh-3rem))] sm:max-w-md"
      contentLabel="Position detail content"
      description="Position detail"
      onClose={() => router.replace(pathname, { scroll: false })}
      title={title}
    >
      {children}
    </AdminDialog>
  )
}

export function PositionDetailRoutePresentation({
  title = 'Position',
  children,
}: {
  title?: ReactNode
  children: ReactNode
}) {
  return <PositionDetailDialog title={title}>{children}</PositionDetailDialog>
}

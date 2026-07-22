import type { ReactNode } from 'react'
import { ObjectDetailDialog } from '@/features/organization/management/components/admin-dialog'

export function MemberDetailDialog({ name, children }: { name: string; children: ReactNode }) {
  return (
    <ObjectDetailDialog title={name} description="Member detail" contentLabel={`${name} detail content`}>
      {children}
    </ObjectDetailDialog>
  )
}

export function MemberDetailRoutePresentation({
  name = 'Member',
  children,
}: {
  name?: string
  children: ReactNode
  presentation?: 'intercepted' | 'standalone'
}) {
  return <MemberDetailDialog name={name}>{children}</MemberDetailDialog>
}

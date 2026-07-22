import type { ReactNode } from 'react'
import { DetailDialog } from '@/features/organization/management/components/responsive-route-dialog'

export function MemberDetailDialog({ name, children }: { name: string; children: ReactNode }) {
  return (
    <DetailDialog title={name} description="Member detail" contentLabel={`${name} detail content`}>
      {children}
    </DetailDialog>
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

import type { ReactNode } from 'react'
import { DetailDialog } from '@/features/organization/management/components/responsive-route-dialog'

export function GroupDetailDialog({ name, children }: { name: string; children: ReactNode }) {
  return (
    <DetailDialog title={name} description="Group detail" contentLabel={`${name} detail content`}>
      {children}
    </DetailDialog>
  )
}

export function GroupDetailRoutePresentation({
  name,
  children,
}: {
  name: string
  children: ReactNode
  presentation?: 'intercepted'
}) {
  return <GroupDetailDialog name={name}>{children}</GroupDetailDialog>
}

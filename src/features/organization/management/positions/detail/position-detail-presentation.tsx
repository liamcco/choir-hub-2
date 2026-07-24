import type { ReactNode } from 'react'
import { ObjectDetailDialog } from '@/features/organization/management/components/admin-dialog'
export function PositionDetailDialog({ name, children }: { name: string; children: ReactNode }) {
  return (
    <ObjectDetailDialog title={name} description="Position detail" contentLabel={`${name} detail content`}>
      {children}
    </ObjectDetailDialog>
  )
}

export function PositionDetailRoutePresentation({
  name = 'Position',
  children,
}: {
  name?: string
  children: ReactNode
}) {
  return <PositionDetailDialog name={name}>{children}</PositionDetailDialog>
}

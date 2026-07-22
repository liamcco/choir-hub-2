import type { ReactNode } from 'react'
import { DetailDialog } from '@/features/organization/management/components/responsive-route-dialog'
export function PositionDetailDialog({ name, children }: { name: string; children: ReactNode }) {
  return (
    <DetailDialog title={name} description="Position detail" contentLabel={`${name} detail content`}>
      {children}
    </DetailDialog>
  )
}

export function PositionDetailRoutePresentation({
  name = 'Position',
  children,
}: {
  name?: string
  children: ReactNode
  presentation?: 'intercepted' | 'standalone'
}) {
  return <PositionDetailDialog name={name}>{children}</PositionDetailDialog>
}

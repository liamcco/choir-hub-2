import type { ReactNode } from 'react'
import { ObjectDetailDialog } from '@/features/organization/management/components/admin-dialog'

export function GroupDetailDialog({ name, children }: { name: string; children: ReactNode }) {
  return (
    <ObjectDetailDialog title={name} description="Group detail" contentLabel={`${name} detail content`}>
      {children}
    </ObjectDetailDialog>
  )
}

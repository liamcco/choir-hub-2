import type { ReactNode } from 'react'
import { Alert } from '@/shared/ui/alert'

export function ManagementState({ kind, children }: { kind: 'empty' | 'denied' | 'error'; children: ReactNode }) {
  return <Alert data-state={kind}>{children}</Alert>
}

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'

import { PositionsPagePanel } from './PositionsPagePanel'

export default function AdminPositionsPage() {
  return (
    <PageShell size="wide">
      <PageHeader
        title="Positions"
        description="Create positions and assign holders through direct group memberships."
        actions={
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/groups" />}>
            <ArrowLeft />
            Groups
          </Button>
        }
      />
      <PositionsPagePanel />
    </PageShell>
  )
}

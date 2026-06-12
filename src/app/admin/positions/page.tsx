import { Plus } from 'lucide-react'
import Link from 'next/link'

import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'

import { PositionsPagePanel } from './PositionsPagePanel'

export default function AdminPositionsPage() {
  return (
    <PageShell size="wide">
      <PageHeader title="Positions" description="Create positions and assign holders through direct group memberships." />
      <div className="mb-6 flex items-center gap-2">
        <Button nativeButton={false} render={<Link href="/admin/positions/create" />}>
          <Plus />
          Create
        </Button>
      </div>
      <PositionsPagePanel />
    </PageShell>
  )
}

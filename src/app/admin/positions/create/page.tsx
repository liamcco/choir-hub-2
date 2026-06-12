import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'

import { CreatePositionPagePanel } from './CreatePositionPagePanel'

export default function AdminCreatePositionPage() {
  return (
    <PageShell size="content">
      <PageHeader title="Create Position" description="Create a position for a selected group." />
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/positions" />}>
          <ArrowLeft />
          Positions
        </Button>
      </div>
      <CreatePositionPagePanel />
    </PageShell>
  )
}

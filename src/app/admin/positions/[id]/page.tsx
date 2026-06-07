import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'

import { PositionDetailPanel } from './PositionDetailPanel'

export default async function AdminPositionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <PageShell size="content">
      <PageHeader title="Position Details" description="Edit position details, group assignments, and holder state." />
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/positions" />}>
          <ArrowLeft />
          Positions
        </Button>
      </div>
      <PositionDetailPanel positionId={id} />
    </PageShell>
  )
}

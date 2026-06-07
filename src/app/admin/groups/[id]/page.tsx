import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'

import { GroupDetailPanel } from './GroupDetailPanel'

export default async function AdminGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <PageShell size="wide">
      <PageHeader title="Group Details" description="Edit group details, move it in the hierarchy, and manage direct memberships." />
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/groups" />}>
          <ArrowLeft />
          Groups
        </Button>
      </div>
      <GroupDetailPanel groupId={id} />
    </PageShell>
  )
}

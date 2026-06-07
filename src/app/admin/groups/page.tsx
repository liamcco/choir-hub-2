import { Layers, Plus } from 'lucide-react'
import Link from 'next/link'

import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'

import { AdminGroupsPanel } from './AdminGroupsPanel'

export default function AdminGroupsPage() {
  return (
    <PageShell size="wide">
      <PageHeader title="Groups" description="Create groups and open group detail pages." />
      <div className="mb-6 flex items-center gap-2">
        <Button nativeButton={false} render={<Link href="/admin/groups/create" />}>
          <Plus />
          Create
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/groups/kinds" />}>
          <Layers />
          Kinds
        </Button>
      </div>
      <AdminGroupsPanel />
    </PageShell>
  )
}

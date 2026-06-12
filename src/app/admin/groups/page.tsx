import Link from 'next/link'
import { BriefcaseBusiness, Layers } from 'lucide-react'

import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'

import { AdminGroupsPanel } from './AdminGroupsPanel'

export default function AdminGroupsPage() {
  return (
    <PageShell size="wide">
      <PageHeader
        title="Groups"
        description="Create groups, inspect the hierarchy, and open group detail pages."
        actions={
          <>
            <Button variant="outline" nativeButton={false} render={<Link href="/admin/groups/kinds" />}>
              <Layers />
              Kinds
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/admin/positions" />}>
              <BriefcaseBusiness />
              Positions
            </Button>
          </>
        }
      />
      <AdminGroupsPanel />
    </PageShell>
  )
}

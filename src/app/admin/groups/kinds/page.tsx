import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'

import { GroupKindsPagePanel } from './GroupKindsPagePanel'

export default function AdminGroupKindsPage() {
  return (
    <PageShell size="wide">
      <PageHeader title="Group Kinds" description="Manage the controlled list of group classifications." />
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/groups" />}>
          <ArrowLeft />
          Groups
        </Button>
      </div>
      <GroupKindsPagePanel />
    </PageShell>
  )
}

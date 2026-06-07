import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'

import { CreateGroupPagePanel } from './CreateGroupPagePanel'

export default function AdminCreateGroupPage() {
  return (
    <PageShell size="content">
      <PageHeader title="Create Group" description="Add a group to the choir hierarchy." />
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/groups" />}>
          <ArrowLeft />
          Groups
        </Button>
      </div>
      <CreateGroupPagePanel />
    </PageShell>
  )
}

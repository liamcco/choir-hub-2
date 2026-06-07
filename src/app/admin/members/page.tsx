import { UserPlus } from 'lucide-react'
import Link from 'next/link'

import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'

import { UsersPanel } from './UsersPanel'

export default function AdminPage() {
  return (
    <PageShell size="wide">
      <PageHeader title="Members" description="View created application users." />
      <div className="mb-6 flex items-center gap-2">
        <Button nativeButton={false} render={<Link href="/admin/members/create" />}>
          <UserPlus />
          Create
        </Button>
      </div>
      <UsersPanel />
    </PageShell>
  )
}

import Link from 'next/link'
import { UserPlus } from 'lucide-react'

import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'

import { AdminPeoplePanel } from './AdminPeoplePanel'

export default function AdminPage() {
  return (
    <PageShell size="wide">
      <PageHeader title="Members" description="View provisioned application persons." />
      <div className="mb-6 flex items-center gap-2">
        <Button nativeButton={false} render={<Link href="/admin/members/create" />}>
          <UserPlus />
          Create
        </Button>
      </div>
      <AdminPeoplePanel />
    </PageShell>
  )
}

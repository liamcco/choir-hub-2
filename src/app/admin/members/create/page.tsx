import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'

import { AdminUsersCreatePanel } from './CreateUsersPanel'

export default function AdminCreateMembersPage() {
  return (
    <PageShell size="wide">
      <PageHeader title="Create Members" description="Create one user or import users from CSV." />
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/members" />}>
          <ArrowLeft />
          Members
        </Button>
      </div>
      <AdminUsersCreatePanel />
    </PageShell>
  )
}

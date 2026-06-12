import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'

import { AdminPeopleCreatePanel } from './AdminPeopleCreatePanel'

export default function AdminCreateMembersPage() {
  return (
    <PageShell size="wide">
      <PageHeader title="Create Members" description="Provision one person or import people from CSV." />
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/members" />}>
          <ArrowLeft />
          Members
        </Button>
      </div>
      <AdminPeopleCreatePanel />
    </PageShell>
  )
}

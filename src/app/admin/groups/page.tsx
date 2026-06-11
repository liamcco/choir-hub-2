import { PageHeader, PageShell } from '@/components/layout/page-shell'

import { AdminGroupsPanel } from './AdminGroupsPanel'

export default function AdminGroupsPage() {
  return (
    <PageShell size="wide">
      <PageHeader title="Groups" description="Manage group kinds, hierarchy, memberships, and positions." />
      <AdminGroupsPanel />
    </PageShell>
  )
}

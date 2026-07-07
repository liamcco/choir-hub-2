import { ShieldAlertIcon } from 'lucide-react'

import { AdminDashboard } from '@/app/admin/_components/admin-dashboard'
import { getAdminDashboardData, getAdminSessionOrRedirect } from '@/app/admin/_lib/data'
import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminPage() {
  const { isAdmin } = await getAdminSessionOrRedirect()

  if (!isAdmin) {
    return (
      <PageShell size="content">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldAlertIcon className="size-5 text-destructive" />
              <div>
                <CardTitle>Not authorized</CardTitle>
                <CardDescription>You need an admin role to access this dashboard.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Your account is signed in, but it does not have permission to manage users, groups, or positions.
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  const data = await getAdminDashboardData()

  return (
    <PageShell size="wide">
      <PageHeader title="Admin dashboard" description="Manage users, group assignments, positions, and account controls." />
      <AdminDashboard data={data} />
    </PageShell>
  )
}

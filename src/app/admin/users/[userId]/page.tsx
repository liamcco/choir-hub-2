import { notFound } from 'next/navigation'
import { ArrowLeftIcon, ShieldAlertIcon } from 'lucide-react'
import Link from 'next/link'

import { UserDetail } from '@/app/admin/_components/admin-dashboard'
import { getAdminMemberDetailData, getAdminSessionOrRedirect } from '@/app/admin/_lib/data'
import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type AdminUserPageProps = {
  params: Promise<{
    userId: string
  }>
}

export default async function AdminUserPage({ params }: AdminUserPageProps) {
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
                <CardDescription>You need an admin role to access this member.</CardDescription>
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

  const { userId } = await params
  const data = await getAdminMemberDetailData(userId)

  if (!data.selectedUser) {
    notFound()
  }

  return (
    <PageShell size="wide">
      <Link href="/admin" className={cn(buttonVariants({ variant: 'ghost' }), 'mb-4')}>
        <ArrowLeftIcon />
        Members
      </Link>
      <PageHeader title={data.selectedUser.name} description="Manage this member’s profile, groups, positions, and account controls." />
      <UserDetail data={data} />
    </PageShell>
  )
}

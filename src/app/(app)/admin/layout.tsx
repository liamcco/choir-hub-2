import { headers } from 'next/headers'
import { forbidden, redirect } from 'next/navigation'
import { auth } from '@/core/auth/auth'
import { requireAdmin } from '@/core/auth/permissions.server'
import { AdminNavigation } from '@/core/navigation/admin-navigation'
import { ROUTES } from '@/core/navigation/site'

export const instant = false

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    redirect(ROUTES.login)
  }

  try {
    await requireAdmin(session)
  } catch {
    forbidden()
  }

  return (
    <>
      <AdminNavigation />
      {children}
    </>
  )
}

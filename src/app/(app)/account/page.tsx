import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AccountSelfServiceScreen } from '@/account-self-service/screen'
import { auth } from '@/lib/auth'
import { ROUTES } from '@/navigation/app-routes'

export const instant = false

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    redirect(ROUTES.login)
  }

  const email = session?.user?.email ?? ''

  return <AccountSelfServiceScreen userEmail={email} />
}

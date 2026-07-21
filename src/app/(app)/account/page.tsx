import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/core/auth/auth'
import { ROUTES } from '@/core/navigation/site'
import { AccountSelfServiceScreen } from '@/features/account/self-service'

export const instant = false

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    redirect(ROUTES.login)
  }

  const email = session?.user?.email ?? ''

  return <AccountSelfServiceScreen userEmail={email} />
}

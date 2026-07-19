import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AccountSelfServiceScreen } from '@/account-self-service/screen'
import { getCurrentAccessActor } from '@/lib/access-actor'
import { auth } from '@/lib/auth'

export const instant = false

export default async function AccountPage() {
  const actor = await getCurrentAccessActor()
  if (!actor) {
    redirect('/login')
  }

  const session = await auth.api.getSession({ headers: await headers() })
  const email = session?.user?.email ?? ''

  return <AccountSelfServiceScreen userEmail={email} />
}

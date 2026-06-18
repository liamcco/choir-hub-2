import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/auth'

import { PasskeyManager } from './passkey-manager'
import { getProfileSessionOrRedirect } from '../_lib/session'

export async function SecurityCard() {
  const { requestHeaders } = await getProfileSessionOrRedirect()
  const passkeys = await auth.api.listPasskeys({
    headers: requestHeaders,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Add a passkey to sign in with your device lock or security key.</CardDescription>
      </CardHeader>
      <CardContent>
        <PasskeyManager passkeys={passkeys} />
      </CardContent>
    </Card>
  )
}

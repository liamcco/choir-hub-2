import { CalendarDays, Mail, UserCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { EmailVerificationForm } from './email-verification-form'
import { ProfileFact } from './profile-fact'
import { UsernameForm } from './username-form'
import { formatDate, toNonEmptyString } from '../_lib/format'
import { getProfileSessionOrRedirect } from '../_lib/session'

export async function AccountCard() {
  const { session } = await getProfileSessionOrRedirect()
  const user = session.user
  const userFields = user as typeof user & Record<string, unknown>
  const username = toNonEmptyString(userFields.username)
  const displayUsername = toNonEmptyString(userFields.displayUsername)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Your personal profile details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <ProfileFact icon={<UserCircle className="size-4" />} label="Name" value={user.name} />
          <ProfileFact icon={<Mail className="size-4" />} label="Email" value={user.email} />
          <ProfileFact icon={<CalendarDays className="size-4" />} label="Joined" value={formatDate(user.createdAt)} />
        </div>

        <div className="grid gap-4">
          <EmailVerificationForm email={user.email} emailVerified={user.emailVerified} />
          <UsernameForm displayUsername={displayUsername} username={username} />
        </div>
      </CardContent>
    </Card>
  )
}

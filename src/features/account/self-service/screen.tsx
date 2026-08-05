import { KeyRoundIcon, UserRoundIcon } from 'lucide-react'
import { PasskeyCard } from '@/features/account/self-service/passkey-card'
import { PasswordChangeForm } from '@/features/account/self-service/password-change-form'
import { UsernameChangeForm } from '@/features/account/self-service/username-change-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function AccountSelfServiceScreen({
  user,
}: {
  user: {
    name: string
    email: string
    username?: string | null
  }
}) {
  const { name, email, username } = user

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-normal">Account</h1>
        <p className="font-medium">
          {name}
          {username && <span className="ml-1 font-normal text-muted-foreground">@{username}</span>}
        </p>
        <p className="text-muted-foreground text-sm">{email}</p>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserRoundIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            <CardTitle>Username</CardTitle>
          </div>
          <CardDescription>Choose the username you can use to sign in instead of your email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <UsernameChangeForm username={username} />
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRoundIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            <CardTitle>Password</CardTitle>
          </div>
          <CardDescription>Change the password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRoundIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            <CardTitle>Passkeys</CardTitle>
          </div>
          <CardDescription>Add a secure, passwordless way to sign in to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <PasskeyCard />
        </CardContent>
      </Card>
    </main>
  )
}

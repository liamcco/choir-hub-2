import { KeyRoundIcon } from 'lucide-react'
import { PasswordChangeForm } from '@/account-self-service/password-change-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AccountSelfServiceScreen({ userEmail }: { userEmail: string }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-normal">Account</h1>
        <p className="text-muted-foreground text-sm">{userEmail}</p>
      </div>

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
    </main>
  )
}

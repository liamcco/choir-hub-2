import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, FieldSeparator } from '@/components/ui/field'
import { Skeleton } from '@/components/ui/skeleton'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { LoginForm } from './login-form'
import { PasskeySignInButton } from './passkey-sign-in-button'

export async function LoginCard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session) {
    redirect('/')
  }

  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-medium text-zinc-500">CSK Choir Hub</p>
        <CardTitle>Sign in</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <FieldGroup>
          <LoginForm />
          <FieldSeparator>or</FieldSeparator>
          <PasskeySignInButton />
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

export function LoginCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-medium text-zinc-500">CSK Choir Hub</p>
        <CardTitle>Sign in</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <FieldGroup>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <FieldSeparator>or</FieldSeparator>
          <Skeleton className="h-10 w-full" />
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

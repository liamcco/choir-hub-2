'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getPostLoginPath } from '@/admin/access-policy'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'

export function DevLoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')

    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: getPostLoginPath(),
      rememberMe: true,
    })

    setIsPending(false)

    if (result.error) {
      setError(result.error.message || 'Sign-in failed.')
      return
    }

    router.push(getPostLoginPath())
    router.refresh()
  }

  return (
    <form onSubmit={submitLogin} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
        {error ? (
          <Field>
            <FieldError>{error}</FieldError>
          </Field>
        ) : null}
      </FieldGroup>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}

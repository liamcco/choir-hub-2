'use client'

import { UserRoundCogIcon } from 'lucide-react'
import { useState } from 'react'
import { authClient } from '@/core/auth/auth-client'
import { ROUTES } from '@/core/navigation/site'
import { Button } from '@/shared/ui/button'

export function ImpersonateUserButton({ userId, userName }: { userId: string; userName: string }) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleImpersonate() {
    setIsPending(true)
    setError(null)
    const result = await authClient.admin.impersonateUser({ userId })
    if (result.error) {
      setError(result.error.message ?? `Could not impersonate ${userName}.`)
      setIsPending(false)
      return
    }
    window.location.assign(ROUTES.home)
  }

  return (
    <div className="space-y-2">
      <Button disabled={isPending} onClick={handleImpersonate} type="button" variant="outline">
        <UserRoundCogIcon data-icon="inline-start" />
        {isPending ? 'Impersonating…' : 'Impersonate'}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

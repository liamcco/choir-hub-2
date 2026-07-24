'use client'

import { LogOutIcon } from 'lucide-react'
import { useState } from 'react'
import { authClient } from '@/core/auth/auth-client'
import { Button } from '@/shared/ui/button'
import { ROUTES } from './site'

export function LogoutButton() {
  const [isPending, setIsPending] = useState(false)

  async function handleLogout() {
    setIsPending(true)
    try {
      const result = await authClient.signOut()
      if (!result.error) window.location.assign(ROUTES.login)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button disabled={isPending} onClick={handleLogout} size="sm" type="button" variant="ghost">
      <LogOutIcon data-icon="inline-start" />
      {isPending ? 'Logging out…' : 'Logout'}
    </Button>
  )
}

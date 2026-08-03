'use client'

import { useState } from 'react'
import { authClient } from '@/core/auth/auth-client'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Field, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

export function PasskeyCard() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleAddPasskey() {
    setMessage(null)
    setError(null)
    setIsPending(true)

    try {
      const result = await authClient.passkey.addPasskey({ name: name.trim() || undefined })
      if (result.error) {
        setError('Unable to add this passkey. Try again or use a different device or browser.')
      } else {
        setMessage('Passkey added. You can now use it to sign in.')
        setName('')
      }
    } catch {
      setError('Unable to add this passkey. Try again or use a different device or browser.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Use Face ID, Touch ID, a device PIN, or a security key to sign in without a password.
      </p>
      <Field>
        <FieldLabel htmlFor="passkey-name">Passkey name (optional)</FieldLabel>
        <Input
          id="passkey-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Personal laptop"
          autoComplete="off"
        />
      </Field>
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="button" className="w-fit" onClick={handleAddPasskey} disabled={isPending}>
        {isPending ? 'Adding passkey...' : 'Add passkey'}
      </Button>
    </div>
  )
}

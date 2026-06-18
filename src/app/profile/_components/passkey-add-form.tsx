'use client'

import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'

export function PasskeyAddForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function addPasskey() {
    setIsPending(true)
    setMessage(null)
    setError(null)

    if (!('PublicKeyCredential' in window)) {
      setError('This browser does not support passkeys.')
      setIsPending(false)
      return
    }

    const result = await authClient.passkey.addPasskey({
      name: name.trim() || undefined,
    })

    setIsPending(false)

    if (result.error) {
      setError(result.error.message || 'Could not add passkey.')
      return
    }

    setName('')
    setMessage('Passkey added.')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="passkey-name">Passkey name</FieldLabel>
          <Input
            autoComplete="off"
            id="passkey-name"
            name="passkey-name"
            onChange={(event) => setName(event.target.value)}
            placeholder="MacBook Touch ID"
            value={name}
          />
          <FieldDescription>Use a name that helps you recognize this device later.</FieldDescription>
        </Field>
      </FieldGroup>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <Button className="w-full sm:w-auto" disabled={isPending} onClick={addPasskey} type="button">
        {isPending ? (
          'Adding passkey...'
        ) : (
          <>
            <Plus data-icon="inline-start" />
            Add passkey
          </>
        )}
      </Button>
    </div>
  )
}

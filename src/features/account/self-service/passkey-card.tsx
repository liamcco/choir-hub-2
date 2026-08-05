'use client'

import { Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { authClient } from '@/core/auth/auth-client'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Field, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

export function PasskeyCard() {
  const { data: passkeys, error: listError, isPending: isListPending, refetch } = authClient.useListPasskeys()
  const [name, setName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [deletingPasskeyId, setDeletingPasskeyId] = useState<string | null>(null)

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
        await refetch()
      }
    } catch {
      setError('Unable to add this passkey. Try again or use a different device or browser.')
    } finally {
      setIsPending(false)
    }
  }

  async function handleDeletePasskey(id: string, label: string) {
    if (!window.confirm(`Delete “${label}”? You will no longer be able to use it to sign in.`)) return

    setMessage(null)
    setError(null)
    setDeletingPasskeyId(id)

    try {
      const result = await authClient.passkey.deletePasskey({ id })
      if (result.error) {
        setError('Unable to delete this passkey. Try again.')
      } else {
        setMessage('Passkey deleted.')
        await refetch()
      }
    } catch {
      setError('Unable to delete this passkey. Try again.')
    } finally {
      setDeletingPasskeyId(null)
    }
  }

  const passkeyListError = listError ? 'Unable to load your passkeys. Try refreshing the page.' : null

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Use Face ID, Touch ID, a device PIN, or a security key to sign in without a password.
      </p>
      <div className="flex flex-col gap-2" aria-live="polite">
        <h3 className="font-medium text-sm">Your passkeys</h3>
        {isListPending && <p className="text-muted-foreground text-sm">Loading passkeys…</p>}
        {!isListPending && passkeyListError && (
          <Alert variant="destructive">
            <AlertDescription>{passkeyListError}</AlertDescription>
          </Alert>
        )}
        {!isListPending && !passkeyListError && passkeys?.length === 0 && (
          <p className="text-muted-foreground text-sm">No passkeys have been added yet.</p>
        )}
        {!isListPending && passkeys && passkeys.length > 0 && (
          <ul className="divide-y rounded-lg border" aria-label="Your passkeys">
            {passkeys.map((passkey) => {
              const label = passkey.name?.trim() || 'Unnamed passkey'
              const isDeleting = deletingPasskeyId === passkey.id

              return (
                <li
                  key={passkey.id}
                  className="flex items-center justify-between gap-4 px-3 py-3 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm">{label}</p>
                    <p className="text-muted-foreground text-xs">
                      Added {new Date(passkey.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePasskey(passkey.id, label)}
                    disabled={isDeleting || deletingPasskeyId !== null}
                    aria-label={`Delete ${label}`}
                  >
                    <Trash2Icon aria-hidden="true" />
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
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

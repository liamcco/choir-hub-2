'use client'

import { CheckCircle2, UserRoundCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

import { UsernameState, claimUsernameAction } from '@/app/profile/actions'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type UsernameFormProps = {
  displayUsername: string | null
  username: string | null
}

export function UsernameForm({ displayUsername, username }: UsernameFormProps) {
  const router = useRouter()
  const hasUsername = Boolean(username)
  const [value, setValue] = useState('')
  const [state, setState] = useState<UsernameState>({
    status: hasUsername ? 'saved' : 'idle',
  })
  const [isSaving, setIsSaving] = useState(false)
  const isUsernameSaved = hasUsername || state.status === 'saved'

  async function saveUsername(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setState({ status: 'idle' })

    const nextState = await claimUsernameAction(value)

    setState(nextState)
    setIsSaving(false)

    if (nextState.status === 'saved') {
      router.refresh()
    }
  }

  if (isUsernameSaved) {
    return (
      <div className="rounded-lg border bg-muted/30 p-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium">Username set</p>
            <p className="wrap-break-word text-sm text-muted-foreground">{displayUsername || username || value}</p>
          </div>
        </div>

        {state.message ? <p className="mt-3 text-sm text-emerald-700">{state.message}</p> : null}
      </div>
    )
  }

  return (
    <form className="rounded-lg border border-dashed p-3" onSubmit={saveUsername}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            autoCapitalize="none"
            autoComplete="username"
            id="username"
            maxLength={30}
            minLength={3}
            onChange={(event) => setValue(event.target.value)}
            pattern="[A-Za-z0-9_.]+"
            placeholder="choir.member"
            required
            value={value}
          />
          <FieldDescription>Use 3-30 letters, numbers, underscores, or periods.</FieldDescription>
        </Field>
      </FieldGroup>

      {state.error ? <FieldError className="mt-3">{state.error}</FieldError> : null}

      <Button className="mt-4 w-full sm:w-auto" disabled={isSaving} type="submit">
        {isSaving ? (
          'Saving...'
        ) : (
          <>
            <UserRoundCheck data-icon="inline-start" />
            Save username
          </>
        )}
      </Button>
    </form>
  )
}

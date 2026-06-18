'use client'

import { CheckCircle2, UserRoundCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'

import { UsernameState, claimUsernameFormAction } from '@/app/profile/actions'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const initialState: UsernameState = {
  status: 'idle',
}

export function UsernameClaimForm() {
  const router = useRouter()
  const [state, formAction, isSaving] = useActionState(claimUsernameFormAction, initialState)

  useEffect(() => {
    if (state.status === 'saved') {
      router.refresh()
    }
  }, [router, state.status])

  if (state.status === 'saved') {
    return (
      <div className="rounded-lg border bg-muted/30 p-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium">Username set</p>
            <p className="wrap-break-word text-sm text-muted-foreground">{state.username}</p>
          </div>
        </div>

        {state.message ? <p className="mt-3 text-sm text-emerald-700">{state.message}</p> : null}
      </div>
    )
  }

  return (
    <form action={formAction} className="rounded-lg border border-dashed p-3">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            autoCapitalize="none"
            autoComplete="username"
            id="username"
            maxLength={30}
            minLength={3}
            name="username"
            pattern="[A-Za-z0-9_.]+"
            placeholder="choir.member"
            required
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

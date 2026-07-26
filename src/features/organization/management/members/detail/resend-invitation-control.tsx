'use client'

import { useActionState } from 'react'
import { Button } from '@/shared/ui/button'

export function ResendInvitationControl({
  action: resendAction,
  userId,
}: {
  userId: string
  action: (userId: string) => Promise<{ success: boolean; message: string }>
}) {
  const [state, action, pending] = useActionState(() => resendAction(userId), null)
  return (
    <form
      action={action}
      className="space-y-2"
      onSubmit={(event) => {
        if (!window.confirm('Resend this invitation email?')) event.preventDefault()
      }}
    >
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? 'Sending invitation' : 'Resend invitation'}
      </Button>
      {state?.message && (
        <p className={state.success ? 'text-sm text-muted-foreground' : 'text-sm text-destructive'}>{state.message}</p>
      )}
    </form>
  )
}

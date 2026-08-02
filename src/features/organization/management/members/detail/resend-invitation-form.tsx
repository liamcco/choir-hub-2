'use client'

import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Button } from '@/shared/ui/button'

export function ResendInvitationForm({
  action: resendAction,
  userId,
}: {
  userId: string
  action: (userId: string) => Promise<{ success: boolean; message: string }>
}) {
  const [state, setState] = useState<{ success: boolean; message: string } | null>(null)
  const form = useForm({
    defaultValues: {},
    onSubmit: async () => {
      if (!window.confirm('Resend this invitation email?')) return
      setState(await resendAction(userId))
    },
  })

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
    >
      <Button type="submit" variant="outline" disabled={form.state.isSubmitting}>
        {form.state.isSubmitting ? 'Sending invitation' : 'Resend invitation'}
      </Button>
      {state?.message && (
        <p className={state.success ? 'text-sm text-muted-foreground' : 'text-sm text-destructive'}>{state.message}</p>
      )}
    </form>
  )
}

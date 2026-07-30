'use client'

import { useEffect, useRef } from 'react'
import type { z } from 'zod'
import type { AnyFormState, FormState } from '@/shared/forms/types'
import { toast } from '@/shared/ui/toast'
import { Alert, AlertDescription } from '../ui/alert'

export function FormMessageToast<T extends FormState<K>, K extends z.ZodType>({
  state,
  onSuccess,
  successAction,
}: {
  state: T
  onSuccess?: () => void
  successAction?: { label: string; onClick: () => void }
}) {
  const handledState = useRef<T | undefined>(undefined)

  useEffect(() => {
    if (!state.message || handledState.current === state) return

    handledState.current = state
    if (state.success) {
      toast.add({
        title: state.message,
        type: 'success',
        actionProps: successAction
          ? {
              children: successAction.label,
              onClick: successAction.onClick,
            }
          : undefined,
      })
      onSuccess?.()
      return
    }

    toast.add({ title: state.message, type: 'error' })
  }, [onSuccess, state, successAction])

  return null
}

export function FormMessageAlert({ state }: { state: AnyFormState }) {
  return state.message ? (
    <Alert variant={state.success ? 'default' : 'destructive'}>
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  ) : null
}

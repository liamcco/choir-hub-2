'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type { z } from 'zod'
import type { FormState } from '@/shared/forms/types'

export function FormMessage<T extends FormState<K>, K extends z.ZodType>({
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
      toast.success(state.message, successAction ? { action: successAction } : undefined)
      onSuccess?.()
      return
    }

    toast.error(state.message)
  }, [onSuccess, state, successAction])

  return null
}

import type { z } from 'zod'
import type { FormState } from '@/shared/forms/types'

export function FormMessage<T extends FormState<K>, K extends z.ZodType>({ state }: { state: T }) {
  if (!state.message) {
    return null
  }

  return (
    <p className={!state.success ? 'text-destructive text-sm' : 'text-muted-foreground text-sm'}>{state.message}</p>
  )
}

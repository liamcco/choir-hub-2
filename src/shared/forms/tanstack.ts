import { mergeForm, useForm, useTransform } from '@tanstack/react-form-nextjs'
import type { z } from 'zod'
import type { AnyFormState } from './types'

export function useServerActionForm<TSchema extends z.ZodType>({
  schema,
  defaultValues,
  state,
}: {
  schema: TSchema
  defaultValues: z.input<TSchema>
  state?: AnyFormState | null
}) {
  return useForm({
    defaultValues,
    // Zod exposes Standard Schema at runtime, but its generic interface cannot
    // currently prove that relationship through this wrapper to TanStack Form.
    validators: { onSubmit: schema as never },
    transform: useTransform((baseForm) => mergeForm(baseForm, toTanStackFormState(state ?? {})), [state]),
  })
}

/**
 * Adapts the repository's server-action form state to the state shape consumed
 * by TanStack Form's `mergeForm` helper.
 */
export function toTanStackFormState(state: AnyFormState) {
  const fields = Object.fromEntries(
    Object.entries(state.fieldErrors ?? {}).map(([name, errors]) => [name, toErrorList(errors)]),
  )
  const hasFieldErrors = Object.keys(fields).length > 0
  const onServer = hasFieldErrors || state.message ? { fields, form: state.message } : undefined

  return {
    errorMap: { onServer },
    errors: state.message ? [state.message] : [],
  }
}

function toErrorList(errors: string | string[] | undefined) {
  if (!errors) return []
  return (Array.isArray(errors) ? errors : [errors]).map((message) => ({ message }))
}

import type { AnyFormState } from './types'

export class FormError extends Error {
  readonly fieldErrors?: Partial<Record<string, string | string[]>>

  constructor(
    message: string,
    options: { field?: string; fieldErrors?: Partial<Record<string, string | string[]>> } = {},
  ) {
    super(message)
    this.name = 'FormError'
    this.fieldErrors = options.fieldErrors ?? (options.field ? { [options.field]: message } : undefined)
  }

  toFormState<T extends AnyFormState>(): T {
    return {
      success: false,
      message: this.message,
      fieldErrors: this.fieldErrors,
    } as T
  }
}

export function handleFormError<T extends AnyFormState>(error: unknown): T {
  if (error instanceof FormError) {
    return error.toFormState<T>()
  }
  throw error
}

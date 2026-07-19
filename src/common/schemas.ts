import z from 'zod'
import { parseDateInput } from '@/common/parsing'

export const dateInput = (message: string) =>
  z.string().transform((value, context) => {
    const date = parseDateInput(value)
    if (!date) {
      context.addIssue({ code: 'custom', message })
      return z.NEVER
    }
    return date
  })

import z from 'zod'
import { parseDateInput } from '@/shared/parsing'

export const dateInput = (message: string) =>
  z.string().transform((value, context) => {
    const date = parseDateInput(value)
    if (!date) {
      context.addIssue({ code: 'custom', message })
      return z.NEVER
    }
    return date
  })

export const requiredText = (message: string) => z.string().refine((value) => value.trim().length > 0, message)

export function isEmail(value: string) {
  return z.email().safeParse(value.trim()).success
}

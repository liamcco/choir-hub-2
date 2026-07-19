import type z from 'zod'

type SchemaInput<TSchema extends z.ZodType> = TSchema extends z.ZodType ? z.input<TSchema> : never

type KeysOfUnion<T> = T extends unknown ? keyof T : never

export type FormState<TSchema extends z.ZodType> = {
  message?: string
  success?: boolean
  fieldErrors?: Partial<Record<Extract<KeysOfUnion<SchemaInput<TSchema>>, string>, string | string[]>>
}

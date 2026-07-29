import { z } from 'zod'

type ParseFormDataResult<T extends z.ZodType> =
  | {
      success: true
      data: z.output<T>
    }
  | {
      success: false
      fieldErrors: z.core.$ZodFlattenedError<z.output<T>>['fieldErrors']
    }

export function parseFormData<T extends z.ZodType>(schema: T, formData: FormData): ParseFormDataResult<T> {
  const rawData = Object.fromEntries(formData.entries())
  const result = schema.safeParse(rawData)

  if (result.success) {
    return {
      success: true,
      data: result.data,
    }
  }

  return {
    success: false,
    fieldErrors: z.flattenError(result.error).fieldErrors,
  }
}

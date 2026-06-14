import z from 'zod'

const booleanQueryParamSchema = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return value
}, z.boolean())

export const membersQuerySchema = z.object({
  onlyDirectMembers: booleanQueryParamSchema.optional(),
})

import { provisionPersonSchema } from './people.mutate'

export const provisionPersonFormSchema = provisionPersonSchema.extend({
  password: provisionPersonSchema.shape.password.transform((password) => password || undefined),
})

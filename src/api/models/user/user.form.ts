import { createUserSchema } from './user.mutate'

export const createUserFormSchema = createUserSchema.extend({
  password: createUserSchema.shape.password.transform((password) => password || undefined),
})

import z from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  password: z.string().min(1, 'Enter your password.'),
})

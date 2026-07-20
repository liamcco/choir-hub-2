import { env } from '../config/env'

export const isProduction = env.VERCEL_ENV === 'production'

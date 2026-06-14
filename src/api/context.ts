import type { auth } from '@/lib/auth'

export type ApiVariables = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

export type ApiEnv = {
  Variables: ApiVariables
}

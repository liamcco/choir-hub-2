import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export type AccessActor = {
  id: string
  role?: string | string[] | null
}

export async function getCurrentAccessActor(): Promise<AccessActor | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return null
  }

  return {
    id: session.user.id,
    role: session.user.role,
  }
}

import { headers } from 'next/headers'
import { type AccessActor, type AdminSurface, getAdminSurfaceAccessDecision } from '@/admin/access-policy'
import { auth } from '@/lib/auth'

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

export async function requireAdminSurfaceActor(getActor: () => Promise<AccessActor | null>, surface: AdminSurface) {
  const actor = await getActor()
  const accessDecision = getAdminSurfaceAccessDecision(actor, surface)
  if (accessDecision.kind === 'redirect') {
    throw new Error(accessDecision.location === '/login' ? 'Unauthorized' : 'Forbidden')
  }
  if (!actor) {
    throw new Error('Unauthorized')
  }
  return actor
}

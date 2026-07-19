import type { AccessActor } from '@/lib/access-actor'
import { type AdminSurface, getAdminSurfaceAccessDecision, ROUTES } from '@/lib/route-access'

export { getCurrentAccessActor } from '@/lib/access-actor'

export async function requireAdminSurfaceActor(getActor: () => Promise<AccessActor | null>, surface: AdminSurface) {
  const actor = await getActor()
  const accessDecision = getAdminSurfaceAccessDecision(actor, surface)
  if (accessDecision.kind === 'redirect') {
    throw new Error(accessDecision.location === ROUTES.login ? 'Unauthorized' : 'Forbidden')
  }
  if (!actor) {
    throw new Error('Unauthorized')
  }
  return actor
}

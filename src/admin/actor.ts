import { type AccessActor, type AdminSurface, getAdminSurfaceAccessDecision } from '@/admin/access-policy'

export { getCurrentAccessActor } from '@/lib/access-actor'

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

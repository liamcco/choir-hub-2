import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { getCurrentAccessActor } from '@/admin/actor'
import type { AccessActor } from '@/lib/access-actor'
import { type AdminSurface, getAdminSurfaceAccessDecision, ROUTES } from '@/lib/route-access'

export type AdminRouteOptions<State> = {
  surface: AdminSurface
  load(actor: AccessActor): Promise<State>
  render(state: State): ReactNode
  isAuthorizationError(error: unknown): boolean
}

export async function renderAdminRoute<State>({
  surface,
  load,
  render,
  isAuthorizationError,
}: AdminRouteOptions<State>) {
  const actor = await getCurrentAccessActor()
  const accessDecision = getAdminSurfaceAccessDecision(actor, surface)
  if (accessDecision.kind === 'redirect') {
    redirect(accessDecision.location)
  }
  if (!actor) {
    throw new Error('Expected admin access policy to redirect unauthenticated actors.')
  }

  let state: State
  try {
    state = await load(actor)
  } catch (error) {
    if (isAuthorizationError(error)) {
      redirect(ROUTES.organization)
    }
    throw error
  }

  return render(state)
}

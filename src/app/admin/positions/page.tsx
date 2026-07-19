import { redirect } from 'next/navigation'
import { getAdminSurfaceAccessDecision } from '@/admin/access-policy'
import { getCurrentAccessActor } from '@/admin/actor'
import { getPositionManagementService } from '@/admin/position-management/runtime'
import { PositionManagementScreen } from '@/admin/position-management/screen'
import { PositionManagementAuthorizationError } from '@/admin/position-management/service'

export const instant = false

export default async function AdminPositionsPage() {
  const actor = await getCurrentAccessActor()
  const accessDecision = getAdminSurfaceAccessDecision(actor, 'organization-admin')
  if (accessDecision.kind === 'redirect') {
    redirect(accessDecision.location)
  }
  if (!actor) {
    redirect('/login')
  }

  try {
    const service = await getPositionManagementService()
    const state = await service.listPositionManagement(actor)
    return <PositionManagementScreen state={state} />
  } catch (error) {
    if (error instanceof PositionManagementAuthorizationError) {
      redirect('/organization')
    }
    throw error
  }
}

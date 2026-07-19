import { redirect } from 'next/navigation'
import { getAdminSurfaceAccessDecision } from '@/admin/access-policy'
import { getCurrentAccessActor } from '@/admin/actor'
import { getPositionAssignmentManagementService } from '@/admin/position-assignment-management/runtime'
import { PositionAssignmentManagementScreen } from '@/admin/position-assignment-management/screen'
import { PositionAssignmentManagementAuthorizationError } from '@/admin/position-assignment-management/service'

export default async function AdminPositionAssignmentsPage() {
  const actor = await getCurrentAccessActor()
  const accessDecision = getAdminSurfaceAccessDecision(actor, 'organization-admin')
  if (accessDecision.kind === 'redirect') {
    redirect(accessDecision.location)
  }
  if (!actor) {
    redirect('/login')
  }

  try {
    const service = await getPositionAssignmentManagementService()
    const state = await service.listPositionAssignmentManagement(actor)
    return <PositionAssignmentManagementScreen state={state} />
  } catch (error) {
    if (error instanceof PositionAssignmentManagementAuthorizationError) {
      redirect('/')
    }
    throw error
  }
}

import { redirect } from 'next/navigation'
import { getAdminSurfaceAccessDecision } from '@/admin/access-policy'
import { getCurrentAccessActor } from '@/admin/actor'
import { getGroupManagementService } from '@/admin/group-management/runtime'
import { GroupManagementScreen } from '@/admin/group-management/screen'
import { GroupManagementAuthorizationError } from '@/admin/group-management/service'

export const instant = false

export default async function AdminGroupsPage() {
  const actor = await getCurrentAccessActor()
  const accessDecision = getAdminSurfaceAccessDecision(actor, 'organization-admin')
  if (accessDecision.kind === 'redirect') {
    redirect(accessDecision.location)
  }
  if (!actor) {
    redirect('/login')
  }

  try {
    const service = await getGroupManagementService()
    const state = await service.listGroupManagement(actor)
    return <GroupManagementScreen state={state} />
  } catch (error) {
    if (error instanceof GroupManagementAuthorizationError) {
      redirect('/organization')
    }
    throw error
  }
}

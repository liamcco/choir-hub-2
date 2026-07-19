import { redirect } from 'next/navigation'
import { getAdminSurfaceAccessDecision } from '@/admin/access-policy'
import { getCurrentAccessActor } from '@/admin/actor'
import { getGroupMembershipManagementService } from '@/admin/group-membership-management/runtime'
import { GroupMembershipManagementScreen } from '@/admin/group-membership-management/screen'
import { GroupMembershipManagementAuthorizationError } from '@/admin/group-membership-management/service'

export default async function AdminGroupMembershipsPage() {
  const actor = await getCurrentAccessActor()
  const accessDecision = getAdminSurfaceAccessDecision(actor, 'organization-admin')
  if (accessDecision.kind === 'redirect') {
    redirect(accessDecision.location)
  }
  if (!actor) {
    redirect('/login')
  }

  try {
    const service = await getGroupMembershipManagementService()
    const state = await service.listGroupMembershipManagement(actor)
    return <GroupMembershipManagementScreen state={state} />
  } catch (error) {
    if (error instanceof GroupMembershipManagementAuthorizationError) {
      redirect('/')
    }
    throw error
  }
}

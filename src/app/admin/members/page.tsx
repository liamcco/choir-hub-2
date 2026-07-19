import { redirect } from 'next/navigation'
import { getAdminSurfaceAccessDecision } from '@/admin/access-policy'
import { getCurrentAccessActor } from '@/admin/actor'
import { getMemberManagementService } from '@/admin/member-management/runtime'
import { MemberManagementScreen } from '@/admin/member-management/screen'
import { MemberManagementAuthorizationError } from '@/admin/member-management/service'

export default async function AdminMembersPage() {
  const actor = await getCurrentAccessActor()
  const accessDecision = getAdminSurfaceAccessDecision(actor, 'members')
  if (accessDecision.kind === 'redirect') {
    redirect(accessDecision.location)
  }
  if (!actor) {
    redirect('/login')
  }

  try {
    const service = await getMemberManagementService()
    const accounts = await service.listManagedMembers(actor)
    return <MemberManagementScreen accounts={accounts} />
  } catch (error) {
    if (error instanceof MemberManagementAuthorizationError) {
      redirect('/')
    }
    throw error
  }
}

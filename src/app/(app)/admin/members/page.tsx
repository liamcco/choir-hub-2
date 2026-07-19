import { getMemberManagementService } from '@/admin/member-management/runtime'
import { MemberManagementScreen } from '@/admin/member-management/screen'
import { MemberManagementAuthorizationError } from '@/admin/member-management/service'
import { renderAdminRoute } from '@/admin/shell/route-runner'

export const instant = false

export default async function AdminMembersPage() {
  return renderAdminRoute({
    surface: 'members',
    async load(actor) {
      const service = await getMemberManagementService()
      return service.listManagedMembers(actor)
    },
    render: (accounts) => <MemberManagementScreen accounts={accounts} />,
    isAuthorizationError: (error) => error instanceof MemberManagementAuthorizationError,
  })
}

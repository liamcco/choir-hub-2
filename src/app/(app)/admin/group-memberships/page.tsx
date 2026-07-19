import { getGroupMembershipManagementService } from '@/admin/group-membership-management/runtime'
import { GroupMembershipManagementScreen } from '@/admin/group-membership-management/screen'
import { GroupMembershipManagementAuthorizationError } from '@/admin/group-membership-management/service'
import { renderAdminRoute } from '@/admin/shell/route-runner'

export const instant = false

export default async function AdminGroupMembershipsPage() {
  return renderAdminRoute({
    surface: 'organization-admin',
    async load(actor) {
      const service = await getGroupMembershipManagementService()
      return service.listGroupMembershipManagement(actor)
    },
    render: (state) => <GroupMembershipManagementScreen state={state} />,
    isAuthorizationError: (error) => error instanceof GroupMembershipManagementAuthorizationError,
  })
}

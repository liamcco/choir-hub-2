import { getGroupManagementService } from '@/admin/group-management/runtime'
import { GroupManagementScreen } from '@/admin/group-management/screen'
import { GroupManagementAuthorizationError } from '@/admin/group-management/service'
import { renderAdminRoute } from '@/admin/shell/route-runner'

export const instant = false

export default async function AdminGroupsPage() {
  return renderAdminRoute({
    surface: 'organization-admin',
    async load(actor) {
      const service = await getGroupManagementService()
      return service.listGroupManagement(actor)
    },
    render: (state) => <GroupManagementScreen state={state} />,
    isAuthorizationError: (error) => error instanceof GroupManagementAuthorizationError,
  })
}

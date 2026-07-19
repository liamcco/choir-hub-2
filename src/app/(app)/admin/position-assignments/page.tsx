import { getPositionAssignmentManagementService } from '@/admin/position-assignment-management/runtime'
import { PositionAssignmentManagementScreen } from '@/admin/position-assignment-management/screen'
import { PositionAssignmentManagementAuthorizationError } from '@/admin/position-assignment-management/service'
import { renderAdminRoute } from '@/admin/shell/route-runner'

export const instant = false

export default async function AdminPositionAssignmentsPage() {
  return renderAdminRoute({
    surface: 'organization-admin',
    async load(actor) {
      const service = await getPositionAssignmentManagementService()
      return service.listPositionAssignmentManagement(actor)
    },
    render: (state) => <PositionAssignmentManagementScreen state={state} />,
    isAuthorizationError: (error) => error instanceof PositionAssignmentManagementAuthorizationError,
  })
}

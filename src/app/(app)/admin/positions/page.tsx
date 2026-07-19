import { getPositionManagementService } from '@/admin/position-management/runtime'
import { PositionManagementScreen } from '@/admin/position-management/screen'
import { PositionManagementAuthorizationError } from '@/admin/position-management/service'
import { renderAdminRoute } from '@/admin/shell/route-runner'

export const instant = false

export default async function AdminPositionsPage() {
  return renderAdminRoute({
    surface: 'organization-admin',
    async load(actor) {
      const service = await getPositionManagementService()
      return service.listPositionManagement(actor)
    },
    render: (state) => <PositionManagementScreen state={state} />,
    isAuthorizationError: (error) => error instanceof PositionManagementAuthorizationError,
  })
}

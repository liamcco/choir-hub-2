import { ROUTES } from '@/core/navigation/site'
import { GroupCreateScreen, StandaloneRouteDetail } from '@/features/organization/management'

export default function CreateGroupPage() {
  return (
    <StandaloneRouteDetail closeHref={ROUTES.adminGroups}>
      <GroupCreateScreen presentation="standalone" />
    </StandaloneRouteDetail>
  )
}

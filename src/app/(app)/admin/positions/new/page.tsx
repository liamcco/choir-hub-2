import { ROUTES } from '@/core/navigation/site'
import { PositionCreateScreen, StandaloneRouteDetail } from '@/features/organization/management'
export default function CreatePositionPage() {
  return (
    <StandaloneRouteDetail closeHref={ROUTES.adminPositions}>
      <PositionCreateScreen presentation="standalone" />
    </StandaloneRouteDetail>
  )
}

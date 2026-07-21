import { ROUTES } from '@/core/navigation/site'
import { MemberCreate, StandaloneRouteDetail } from '@/features/organization/management'

export default function CreateMemberPage() {
  return (
    <StandaloneRouteDetail closeHref={ROUTES.adminMembers}>
      <MemberCreate />
    </StandaloneRouteDetail>
  )
}

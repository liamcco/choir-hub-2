import { MemberCreate, RouteBackResponsiveDialog } from '@/features/organization/management'
export default function InterceptedMemberCreatePage() {
  return (
    <RouteBackResponsiveDialog contentLabel="Create Member content" description="Create Member" title="Create Member">
      <MemberCreate />
    </RouteBackResponsiveDialog>
  )
}

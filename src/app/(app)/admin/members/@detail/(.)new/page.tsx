import { MemberCreate, RouteBackResponsiveDialog } from '@/features/organization/management'

export default function InterceptedCreateMemberPage() {
  return (
    <RouteBackResponsiveDialog title="Create Member" description="New Member" contentLabel="Create Member content">
      <MemberCreate showHeading={false} />
    </RouteBackResponsiveDialog>
  )
}

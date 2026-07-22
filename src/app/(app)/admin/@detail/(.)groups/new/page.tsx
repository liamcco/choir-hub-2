import { GroupCreateScreen, RouteBackResponsiveDialog } from '@/features/organization/management'
export default function InterceptedGroupCreatePage() {
  return (
    <RouteBackResponsiveDialog contentLabel="Create Group content" description="Create Group" title="Create Group">
      <GroupCreateScreen presentation="intercepted" />
    </RouteBackResponsiveDialog>
  )
}

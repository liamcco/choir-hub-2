import { GroupCreateScreen, RouteBackResponsiveDialog } from '@/features/organization/management'

export default function InterceptedCreateGroupPage() {
  return (
    <RouteBackResponsiveDialog title="Create Group" description="New Group" contentLabel="Create Group content">
      <GroupCreateScreen presentation="intercepted" />
    </RouteBackResponsiveDialog>
  )
}

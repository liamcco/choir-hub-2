import { PositionCreateScreen, RouteBackResponsiveDialog } from '@/features/organization/management'
export default function InterceptedPositionCreatePage() {
  return (
    <RouteBackResponsiveDialog
      contentLabel="Create Position content"
      description="Create Position"
      title="Create Position"
    >
      <PositionCreateScreen presentation="intercepted" />
    </RouteBackResponsiveDialog>
  )
}

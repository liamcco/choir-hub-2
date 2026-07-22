import { PositionCreateScreen, RouteBackResponsiveDialog } from '@/features/organization/management'
export default function InterceptedCreatePositionPage() {
  return (
    <RouteBackResponsiveDialog
      title="Create Position"
      description="New Position"
      contentLabel="Create Position content"
    >
      <PositionCreateScreen presentation="intercepted" />
    </RouteBackResponsiveDialog>
  )
}

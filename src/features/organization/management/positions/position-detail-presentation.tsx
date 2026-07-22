import type { ReactNode } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { RouteBackResponsiveDialog } from '@/features/organization/management/components/responsive-route-dialog'
import { StandaloneRouteDetail } from '@/features/organization/management/components/standalone-route-detail'
export function PositionDetailRoutePresentation(
  props:
    | { presentation: 'standalone'; children: ReactNode }
    | { presentation: 'intercepted'; name: string; children: ReactNode },
) {
  return props.presentation === 'standalone' ? (
    <StandaloneRouteDetail closeHref={ROUTES.adminPositions}>{props.children}</StandaloneRouteDetail>
  ) : (
    <RouteBackResponsiveDialog
      title={props.name}
      description="Position detail"
      contentLabel={`${props.name} detail content`}
    >
      {props.children}
    </RouteBackResponsiveDialog>
  )
}

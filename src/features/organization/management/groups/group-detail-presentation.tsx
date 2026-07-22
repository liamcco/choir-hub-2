import type { ReactNode } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { RouteNavigationResponsiveDialog } from '@/features/organization/management/components/responsive-route-dialog'
import { StandaloneRouteDetail } from '@/features/organization/management/components/standalone-route-detail'

export function GroupDetailRoutePresentation(
  props:
    | { presentation: 'standalone'; children: ReactNode }
    | { presentation: 'intercepted'; name: string; children: ReactNode },
) {
  if (props.presentation === 'standalone') {
    return <StandaloneRouteDetail closeHref={ROUTES.adminGroups}>{props.children}</StandaloneRouteDetail>
  }

  return (
    <RouteNavigationResponsiveDialog
      title={props.name}
      description="Group detail"
      contentLabel={`${props.name} detail content`}
    >
      {props.children}
    </RouteNavigationResponsiveDialog>
  )
}

import {
  BriefcaseBusinessIcon,
  Building2Icon,
  GitForkIcon,
  KeyRoundIcon,
  LogInIcon,
  type LucideIcon,
  UserRoundCogIcon,
} from 'lucide-react'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { type NavigationRouteId, ROUTES } from '@/core/navigation/site'
import { buttonVariants } from '@/shared/ui/button'
import { cn } from '@/shared/utils'
import { userIsAdmin } from '../auth/permissions.server'

export type NavigationRoute = {
  id: NavigationRouteId
  href: (typeof ROUTES)[NavigationRouteId]
  section: 'member' | 'admin'
}

export type NavigationItem = NavigationRoute & {
  label: string
  Icon: LucideIcon
}

const NAVIGATION_PRESENTATION = {
  login: { label: 'Login', Icon: LogInIcon },
  organization: { label: 'Organization', Icon: GitForkIcon },
  account: { label: 'Account', Icon: KeyRoundIcon },
  adminMembers: { label: 'Members', Icon: UserRoundCogIcon },
  adminGroups: { label: 'Groups', Icon: Building2Icon },
  adminPositions: { label: 'Positions', Icon: BriefcaseBusinessIcon },
} satisfies Record<NavigationRouteId, { label: string; Icon: LucideIcon }>

const AUTHENTICATED_NAVIGATION_ROUTES = [
  { id: 'organization', href: ROUTES.organization, section: 'member' },
  { id: 'account', href: ROUTES.account, section: 'member' },
  { id: 'adminMembers', href: ROUTES.adminMembers, section: 'admin' },
  { id: 'adminGroups', href: ROUTES.adminGroups, section: 'admin' },
  { id: 'adminPositions', href: ROUTES.adminPositions, section: 'admin' },
] as const satisfies readonly NavigationRoute[]

const LOGIN_NAVIGATION_ROUTE = {
  id: 'login',
  href: ROUTES.login,
  section: 'member',
} as const satisfies NavigationRoute

export function getNavigationItems(config: NavigationConfig | null): NavigationItem[] {
  const routes = config
    ? AUTHENTICATED_NAVIGATION_ROUTES.filter((route) => route.section !== 'admin' || config.showAdmin)
    : [LOGIN_NAVIGATION_ROUTE]
  return routes.map((item) => ({ ...item, ...NAVIGATION_PRESENTATION[item.id] }))
}

type NavigationConfig = {
  showAdmin: boolean
}

interface AppNavigationTemplateProps {
  config: NavigationConfig | null
}
export function AppNavigationTemplate({ config }: AppNavigationTemplateProps) {
  const items = getNavigationItems(config)

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={ROUTES.home} className="font-semibold text-base tracking-normal">
            CSK Choir Hub
          </Link>
          <nav aria-label="Primary navigation" className="flex flex-wrap items-center gap-1.5">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'max-w-full')}
              >
                <item.Icon data-icon="inline-start" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

export function AppNavigation() {
  return (
    <Suspense fallback={<AppNavigationTemplate config={null} />}>
      <RuntimeAppNavigation />
    </Suspense>
  )
}

export async function RuntimeAppNavigation() {
  await connection()
  const isAdmin = await userIsAdmin()
  return <AppNavigationTemplate config={{ showAdmin: isAdmin }} />
}

import {
  BriefcaseBusinessIcon,
  Building2Icon,
  GitForkIcon,
  KeyRoundIcon,
  LogInIcon,
  type LucideIcon,
  UserRoundCogIcon,
  UsersIcon,
} from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Suspense } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { getPostLoginPath, type NavigationRouteId, ROUTES } from '@/navigation/app-routes'

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
  adminGroupMemberships: { label: 'Group Memberships', Icon: UsersIcon },
  adminPositions: { label: 'Positions', Icon: BriefcaseBusinessIcon },
  adminPositionAssignments: { label: 'Position Assignments', Icon: GitForkIcon },
} satisfies Record<NavigationRouteId, { label: string; Icon: LucideIcon }>

const AUTHENTICATED_NAVIGATION_ROUTES = [
  { id: 'organization', href: ROUTES.organization, section: 'member' },
  { id: 'account', href: ROUTES.account, section: 'member' },
  { id: 'adminMembers', href: ROUTES.adminMembers, section: 'admin' },
  { id: 'adminGroups', href: ROUTES.adminGroups, section: 'admin' },
  { id: 'adminGroupMemberships', href: ROUTES.adminGroupMemberships, section: 'admin' },
  { id: 'adminPositions', href: ROUTES.adminPositions, section: 'admin' },
  { id: 'adminPositionAssignments', href: ROUTES.adminPositionAssignments, section: 'admin' },
] as const satisfies readonly NavigationRoute[]
const LOGIN_NAVIGATION_ROUTE = {
  id: 'login',
  href: ROUTES.login,
  section: 'member',
} as const satisfies NavigationRoute

export function getNavigationItems(isAuthenticated: boolean): NavigationItem[] {
  const routes = isAuthenticated ? AUTHENTICATED_NAVIGATION_ROUTES : [LOGIN_NAVIGATION_ROUTE]
  return routes.map((item) => ({ ...item, ...NAVIGATION_PRESENTATION[item.id] }))
}

export function AppNavigationTemplate({ isAuthenticated }: { isAuthenticated: boolean }) {
  const items = getNavigationItems(isAuthenticated)

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={getPostLoginPath()} className="font-semibold text-base tracking-normal">
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
    <Suspense fallback={<AppNavigationTemplate isAuthenticated={true} />}>
      <RuntimeAppNavigation />
    </Suspense>
  )
}

export async function RuntimeAppNavigation() {
  const session = await auth.api.getSession({ headers: await headers() })
  return <AppNavigationTemplate isAuthenticated={Boolean(session?.user)} />
}

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
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { type AccessActor, getCurrentAccessActor } from '@/lib/access-actor'
import {
  type AccessibleNavigationRoute,
  getAccessibleNavigationRoutes,
  getPostLoginPath,
  type NavigationRouteId,
} from '@/lib/route-access'
import { cn } from '@/lib/utils'

export type NavigationItem = AccessibleNavigationRoute & {
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

export function getNavigationItems(actor: AccessActor | null | undefined): NavigationItem[] {
  return getAccessibleNavigationRoutes(actor).map((item) => ({ ...item, ...NAVIGATION_PRESENTATION[item.id] }))
}

export function AppNavigation({ actor }: { actor: AccessActor | null }) {
  const items = getNavigationItems(actor)

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={getPostLoginPath(actor)} className="font-semibold text-base tracking-normal">
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

export async function RuntimeAppNavigation() {
  const actor = await getCurrentAccessActor()
  return <AppNavigation actor={actor} />
}

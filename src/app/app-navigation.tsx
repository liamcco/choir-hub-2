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
import { type AccessActor, canAccessAdminSurface, getPostLoginPath } from '@/admin/access-policy'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type NavigationItem = {
  href: string
  label: string
  Icon: LucideIcon
  section: 'member' | 'admin'
}

const MEMBER_NAVIGATION: NavigationItem[] = [
  { href: '/organization', label: 'Organization', Icon: GitForkIcon, section: 'member' },
  { href: '/account', label: 'Account', Icon: KeyRoundIcon, section: 'member' },
]

const ADMIN_NAVIGATION: NavigationItem[] = [
  { href: '/admin/members', label: 'Members', Icon: UserRoundCogIcon, section: 'admin' },
  { href: '/admin/groups', label: 'Groups', Icon: Building2Icon, section: 'admin' },
  { href: '/admin/group-memberships', label: 'Group Memberships', Icon: UsersIcon, section: 'admin' },
  { href: '/admin/positions', label: 'Positions', Icon: BriefcaseBusinessIcon, section: 'admin' },
  { href: '/admin/position-assignments', label: 'Position Assignments', Icon: GitForkIcon, section: 'admin' },
]

export function getNavigationItems(actor: AccessActor | null | undefined): NavigationItem[] {
  if (!actor) {
    return [{ href: '/login', label: 'Login', Icon: LogInIcon, section: 'member' }]
  }

  return canAccessAdminSurface(actor) ? [...MEMBER_NAVIGATION, ...ADMIN_NAVIGATION] : MEMBER_NAVIGATION
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

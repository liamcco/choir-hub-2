import { headers } from 'next/headers'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { auth } from '@/core/auth/auth'
import { type NavigationRouteId, ROUTES } from '@/core/navigation/site'
import { buttonVariants } from '@/shared/ui/button'
import { cn } from '@/shared/utils'
import { isUserAdmin } from '../auth/permissions.server'
import { LogoutButton } from './logout-button'

export type NavigationRoute = {
  id: NavigationRouteId
  href: (typeof ROUTES)[NavigationRouteId]
  section: 'member' | 'admin'
}

export type NavigationItem = NavigationRoute & {
  label: string
}

const NAVIGATION_PRESENTATION = {
  login: { label: 'Login' },
  account: { label: 'Account' },
  adminUsers: { label: 'Admin' },
} satisfies Partial<Record<NavigationRouteId, { label: string }>>

const AUTHENTICATED_NAVIGATION_ROUTES = [
  { id: 'account', href: ROUTES.account, section: 'member' },
  { id: 'adminUsers', href: ROUTES.adminUsers, section: 'admin' },
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
  impersonatingUserName?: string
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
                {item.label}
              </Link>
            ))}
            {config ? <LogoutButton isImpersonating={Boolean(config.impersonatingUserName)} /> : null}
          </nav>
        </div>
        {config?.impersonatingUserName ? (
          <div className="rounded-md border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground" role="status">
            Impersonating {config.impersonatingUserName}
          </div>
        ) : null}
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
  const session = await auth.api.getSession({ headers: await headers() })
  const isAdmin = await isUserAdmin(session)
  return (
    <AppNavigationTemplate
      config={{
        showAdmin: isAdmin,
        ...(session?.session.impersonatedBy ? { impersonatingUserName: session.user.name } : {}),
      }}
    />
  )
}

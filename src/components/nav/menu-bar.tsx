import { SignOutButton } from '@/components/auth/sign-out-button'
import { ModeToggle } from '@/components/theme/mode-toggle'
import { buttonVariants } from '@/components/ui/button'
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu'
import { auth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { headers } from 'next/headers'
import Link from 'next/link'

function hasAdminRole(role: string | null | undefined) {
  return (role ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .includes('admin')
}

export async function Navigation() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-4">
        {hasAdminRole(session?.user.role) ? (
          <NavigationMenuItem>
            <Link href="/admin" className={cn(buttonVariants({ variant: 'ghost' }))}>
              Admin
            </Link>
          </NavigationMenuItem>
        ) : null}
        <NavigationMenuItem>
          <SignOutButton />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <ModeToggle />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

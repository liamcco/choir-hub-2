'use client'

import Link from 'next/link'
import * as React from 'react'

import { SignOutButton } from '@/components/auth/sign-out-button'
import { ModeToggle } from '@/components/theme/mode-toggle'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { authClient } from '@/lib/auth-client'

const authenticatedNavigationItems: { title: string; href: string; description: string }[] = [
  {
    title: 'Profile',
    href: '/profile',
    description: 'Manage your account details, username, email verification, and passkeys.',
  },
  {
    title: 'Admin',
    href: '/admin',
    description: 'Manage members, group hierarchy, memberships, and positions.',
  },
]

export function Navigation() {
  const { data: session } = authClient.useSession()
  const navigationItems = session
    ? authenticatedNavigationItems.filter((item) => item.href !== '/admin' || session.user.role === 'admin')
    : []

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-4">
        {navigationItems.length ? (
          <NavigationMenuItem>
            <NavigationMenuTrigger>Links</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-80 gap-2 md:w-110 md:grid-cols-2">
                {navigationItems.map((item) => (
                  <ListItem key={item.title} title={item.title} href={item.href}>
                    {item.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
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

function ListItem({ title, children, href, ...props }: React.ComponentPropsWithoutRef<'li'> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink
        closeOnClick
        render={
          <Link href={href}>
            <div className="flex flex-col gap-1 text-sm">
              <div className="leading-none font-medium">{title}</div>
              <div className="line-clamp-2 text-muted-foreground">{children}</div>
            </div>
          </Link>
        }
      />
    </li>
  )
}

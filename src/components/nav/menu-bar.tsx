import * as React from 'react';
import Link from 'next/link';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

import { SignOutButton } from '@/components/nav/sign-out-button';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const components: { title: string; href: string; description: string }[] = [
  {
    title: 'Profile',
    href: '/profile',
    description: 'A user profile component that displays user information and allows for editing.',
  },
  {
    title: 'Resources',
    href: '/resources',
    description: 'A component for displaying a list of resources, such as articles, videos, or links.',
  },
  {
    title: 'Create Resource',
    href: '/resources/create',
    description: 'A component for creating new resources, such as articles, videos, or links.',
  },
];

export async function Navigation() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-100 gap-2 md:w-125 md:grid-cols-2 lg:w-150">
              {components.map((component) => (
                <ListItem key={component.title} title={component.title} href={component.href}>
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle()}
            render={session ? <SignOutButton /> : <Link href="/login">Sign in</Link>}
          />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({ title, children, href, ...props }: React.ComponentPropsWithoutRef<'li'> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink
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
  );
}

import Link from 'next/link';
import * as React from 'react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { ModeToggle } from '../theme/mode-toggle';
import { SignOutButton } from './sign-out-button';

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
  {
    title: 'Server streaming',
    href: '/wait',
    description:
      'A component that demonstrates server streaming with React Suspense, showing how to handle loading states for multiple components.',
  },
];

export function Navigation() {
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-4">
        <NavigationMenuItem>
          <NavigationMenuTrigger>Links</NavigationMenuTrigger>
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
          <SignOutButton />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <ModeToggle />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
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
  );
}

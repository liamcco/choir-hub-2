'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/utils'
import { ROUTES } from './site'

const ADMIN_RESOURCES = [
  { label: 'Users', href: ROUTES.adminUsers },
  { label: 'Groups', href: ROUTES.adminGroups },
  { label: 'Positions', href: ROUTES.adminPositions },
  { label: 'Placement', href: ROUTES.adminPlacement },
] as const

export function AdminNavigation() {
  const pathname = usePathname()

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-8 lg:pt-6">
      <nav aria-label="Admin resources" className="flex items-center gap-6 border-b text-sm">
        {ADMIN_RESOURCES.map((resource) => {
          const isActive = pathname === resource.href
          return (
            <Link
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                '-mb-px border-b-2 px-0.5 pb-4 text-muted-foreground transition-colors hover:text-foreground',
                isActive && 'border-foreground font-medium text-foreground',
              )}
              href={resource.href}
              key={resource.href}
            >
              {resource.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

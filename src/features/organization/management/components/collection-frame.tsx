import Link from 'next/link'
import type { ReactNode } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { cn } from '@/shared/utils'

type ManagementResource = 'members' | 'groups' | 'positions'

export function CollectionFrame({
  activeResource,
  title,
  description,
  actions,
  children,
}: {
  activeResource: ManagementResource
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-8 lg:py-12">
      <nav aria-label="Organization management" className="flex items-center gap-6 border-b text-sm">
        {managementResources.map((resource) => (
          <Link
            aria-current={activeResource === resource.id ? 'page' : undefined}
            className={cn(
              '-mb-px border-b-2 px-0.5 pb-4 text-muted-foreground transition-colors hover:text-foreground',
              activeResource === resource.id && 'border-foreground font-medium text-foreground',
            )}
            href={resource.href}
            key={resource.id}
          >
            {resource.label}
          </Link>
        ))}
      </nav>
      <header className="flex flex-col gap-5 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {actions}
      </header>
      {children}
    </main>
  )
}

const managementResources = [
  { id: 'members', label: 'Members', href: ROUTES.adminMembers },
  { id: 'groups', label: 'Groups', href: ROUTES.adminGroups },
  { id: 'positions', label: 'Positions', href: ROUTES.adminPositions },
] as const

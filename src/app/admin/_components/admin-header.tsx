'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

import { adminSections } from '@/app/admin/admin.config'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'

const segmentLabels: Record<string, string> = {
  admin: 'Admin',
  create: 'Create',
  groups: 'Groups',
  kinds: 'Kinds',
  members: 'Members',
  positions: 'Positions',
  'org-structure': 'Org Structure',
}

export function AdminHeader() {
  const pathname = usePathname()
  const crumbs = getBreadcrumbs(pathname)

  return (
    <div className="border-b bg-background/95">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => (
              <Fragment key={crumb.href}>
                {index > 0 ? <BreadcrumbSeparator /> : null}
                <BreadcrumbItem>
                  {index === crumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link href={crumb.href} />}>{crumb.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <nav aria-label="Admin sections" className="flex flex-wrap gap-2">
          {adminSections.map((section) => {
            const isActive = pathname === section.href || pathname.startsWith(`${section.href}/`)

            return (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  'inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                  isActive && 'bg-muted text-foreground',
                )}
              >
                <section.icon className="size-4" />
                {section.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`
    const isDynamicId = segment.length > 16 && !segmentLabels[segment]

    return {
      href,
      label: isDynamicId ? 'Details' : (segmentLabels[segment] ?? toTitleCase(segment)),
    }
  })
}

function toTitleCase(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ')
}

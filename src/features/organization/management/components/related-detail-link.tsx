'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'

export function RelatedDetailLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const origin = searchParams?.get('detailOrigin') ?? pathname
  const target = new URL(href, 'http://local')
  if (origin) target.searchParams.set('detailOrigin', origin)

  return (
    <Link className="font-medium underline-offset-4 hover:underline" href={`${target.pathname}${target.search}`}>
      {children}
    </Link>
  )
}

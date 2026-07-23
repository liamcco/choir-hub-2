'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

export function RelatedDetailLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="font-medium underline-offset-4 hover:underline" href={href}>
      {children}
    </Link>
  )
}

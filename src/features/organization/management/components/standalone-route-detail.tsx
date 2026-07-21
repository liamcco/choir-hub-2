import { XIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { buttonVariants } from '@/shared/ui/button'

export function StandaloneRouteDetail({ closeHref, children }: { closeHref: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-5xl flex-col px-4 py-5 sm:px-8 sm:py-10">
      <div className="mb-6 flex justify-end border-b pb-4">
        <Link className={buttonVariants({ variant: 'outline', size: 'sm' })} href={closeHref}>
          <XIcon data-icon="inline-start" />
          Close
        </Link>
      </div>
      {children}
    </main>
  )
}

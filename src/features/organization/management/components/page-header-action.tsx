import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { buttonVariants } from '@/shared/ui/button'
import { cn } from '@/shared/utils'

export function PageHeaderActions({ children }: { children: ReactNode }) {
  return <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>
}

export function PageHeaderAction({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={cn(buttonVariants({ size: 'lg' }), className)} {...props} />
}

'use client'

import { XIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import type { ComponentProps, ReactNode } from 'react'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog'

export function ResponsiveRouteDialog({
  title,
  description,
  contentLabel,
  onClose,
  headerAction,
  children,
}: {
  title: string
  description?: string
  contentLabel: string
  onClose: () => void
  headerAction?: ReactNode
  children: ReactNode
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="inset-0 top-0 left-0 h-dvh max-h-none max-w-none translate-x-0 translate-y-0 grid-rows-[auto_minmax(0,1fr)] gap-0 rounded-none p-0 sm:top-1/2 sm:left-1/2 sm:h-[min(52rem,calc(100dvh-3rem))] sm:max-w-5xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-start justify-between gap-4 border-b px-4 py-3 sm:px-6">
          <div className="min-w-0 space-y-1">
            <DialogTitle className="truncate text-lg">{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </div>
          <div className="flex items-center gap-2">
            {headerAction}
            <Button aria-label="Close" onClick={onClose} size="sm" type="button" variant="outline">
              <XIcon data-icon="inline-start" />
              Close
            </Button>
          </div>
        </DialogHeader>
        <div aria-label={contentLabel} className="min-h-0 overflow-y-auto px-4 py-6 sm:px-8" role="region">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function DetailDialog(props: Omit<ComponentProps<typeof ResponsiveRouteDialog>, 'onClose'>) {
  const router = useRouter()
  const pathname = usePathname()

  return <ResponsiveRouteDialog {...props} onClose={() => router.replace(pathname, { scroll: false })} />
}

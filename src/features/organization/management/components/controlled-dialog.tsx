'use client'

import { type ReactNode, useState } from 'react'
import { AdminDialog } from './admin-dialog'

export function ControlledDialog({
  trigger,
  title,
  description,
  contentLabel,
  children,
}: {
  trigger: (open: () => void) => ReactNode
  title: string
  description: string
  contentLabel: string
  children: (close: () => void) => ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const close = () => setIsOpen(false)

  return (
    <>
      {trigger(() => setIsOpen(true))}
      {isOpen ? (
        <AdminDialog title={title} description={description} contentLabel={contentLabel} onClose={close}>
          {children(close)}
        </AdminDialog>
      ) : null}
    </>
  )
}

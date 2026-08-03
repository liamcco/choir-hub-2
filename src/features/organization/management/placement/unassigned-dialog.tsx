'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import type { PlacementUser } from './query'

export function UnassignedDialog({ users, query }: { users: PlacementUser[]; query: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)} type="button" variant="outline">
        Unassigned ({users.length})
      </Button>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Unassigned members</DialogTitle>
            <DialogDescription>Members in this choir without a section placement.</DialogDescription>
          </DialogHeader>
          {users.length ? (
            <div className="divide-y rounded-xl border">
              {users.map((user) => (
                <div className="flex items-center justify-between gap-4 px-4 py-3" key={user.id}>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.voice ?? 'No voice'}</p>
                  </div>
                  <Link href={`/admin/placement?${query}&detail=${encodeURIComponent(user.id)}`}>
                    <Button size="sm" type="button" variant="outline">
                      Transfer
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
              No unassigned members.
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

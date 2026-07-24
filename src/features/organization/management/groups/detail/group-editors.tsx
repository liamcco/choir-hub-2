'use client'

import { useState } from 'react'
import type { Group } from '@/prisma/generated/client'
import { Button } from '@/shared/ui/button'
import { type GroupFormAction, UpdateGroupForm } from './group-form'

export function GroupFieldEditor({
  group,
  groups,
  action,
}: {
  group: Group
  groups: Group[]
  action: GroupFormAction
}) {
  const [isEditing, setIsEditing] = useState(false)

  if (!isEditing) {
    return (
      <Button onClick={() => setIsEditing(true)} type="button" variant="outline">
        Edit Group
      </Button>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border bg-muted/20 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold">Edit Group</h2>
        <Button onClick={() => setIsEditing(false)} size="sm" type="button" variant="ghost">
          Cancel
        </Button>
      </div>
      <UpdateGroupForm action={action} group={group} groups={groups} />
    </div>
  )
}

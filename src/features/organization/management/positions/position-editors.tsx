'use client'
import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import type { PositionDetailView } from './position-detail'
import { UpdatePositionForm } from './position-form'
export function PositionFieldEditor({ position }: { position: PositionDetailView }) {
  const [isEditing, setIsEditing] = useState(false)
  if (!isEditing)
    return (
      <Button onClick={() => setIsEditing(true)} type="button" variant="outline">
        Edit Position
      </Button>
    )
  return (
    <div className="space-y-4 rounded-lg border bg-muted/20 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold">Edit Position</h2>
        <Button onClick={() => setIsEditing(false)} size="sm" type="button" variant="ghost">
          Cancel
        </Button>
      </div>
      <UpdatePositionForm
        groups={position.groups}
        positionView={{
          position: position.position,
          scopeGroups: position.scopeGroups,
          scopeLabel: position.scopeLabel,
          scopeKind: position.scopeGroups.length > 1 ? 'shared' : 'single',
          duplicateNameCount: 1,
        }}
      />
    </div>
  )
}

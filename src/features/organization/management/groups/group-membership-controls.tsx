'use client'

import { UserPlusIcon } from 'lucide-react'
import { useState } from 'react'
import type { NamedEntity } from '@/shared/types'
import { Button } from '@/shared/ui/button'
import { AddUserGroupForm, EndGroupMembershipForm } from './group-membership-control-forms'

export function AddUserGroupControl({ userId, groups }: { userId: string; groups: NamedEntity[] }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} type="button" variant="outline">
        <UserPlusIcon data-icon="inline-start" />
        Add Group
      </Button>
    )
  }

  return <AddUserGroupForm groups={groups} userId={userId} onCancel={() => setIsOpen(false)} />
}

export function EndGroupMembershipControl({
  membership,
  groupName,
}: {
  membership: { id: string; groupId: string; userId: string; userLabel: string; startsAt: Date }
  groupName: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <Button
        aria-label={`End ${membership.userLabel} membership`}
        onClick={() => setIsOpen(true)}
        size="sm"
        type="button"
        variant="outline"
      >
        End
      </Button>
    )
  }

  return <EndGroupMembershipForm groupName={groupName} membership={membership} onCancel={() => setIsOpen(false)} />
}

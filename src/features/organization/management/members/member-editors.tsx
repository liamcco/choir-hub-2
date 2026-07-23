'use client'

import { LockIcon, SaveIcon, UnlockIcon } from 'lucide-react'
import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import type { MemberStatus } from '@/prisma/generated/client'
import { Button } from '@/shared/ui/button'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'
import { updateAccountAccessAction, updateMemberStatusAction } from './actions'
import type { AccountAccessState } from './service'

export function MemberStatusEditor({ userId, status }: { userId: string; status: MemberStatus }) {
  const [isEditing, setIsEditing] = useState(false)
  return (
    <div className="rounded-lg border bg-background p-3">
      <Button
        aria-expanded={isEditing}
        onClick={() => setIsEditing((current) => !current)}
        size="sm"
        type="button"
        variant="ghost"
      >
        Edit Member Status
      </Button>
      {isEditing ? (
        <form action={updateMemberStatusAction.bind(null, userId)} className="mt-3 flex gap-2">
          <NativeSelect aria-label="Member Status" defaultValue={status} name="status" size="sm">
            <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
            <NativeSelectOption value="PASSIVE">Passive</NativeSelectOption>
            <NativeSelectOption value="FORMER">Former</NativeSelectOption>
          </NativeSelect>
          <PendingStatusSubmit />
        </form>
      ) : null}
    </div>
  )
}

export function AccountAccessEditor({ userId, accessState }: { userId: string; accessState: AccountAccessState }) {
  const [isEditing, setIsEditing] = useState(false)
  const nextAccessState: AccountAccessState = accessState === 'enabled' ? 'disabled' : 'enabled'

  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        aria-expanded={isEditing}
        onClick={() => setIsEditing((current) => !current)}
        size="sm"
        type="button"
        variant="ghost"
      >
        Edit account access
      </Button>
      {isEditing ? (
        <form action={updateAccountAccessAction.bind(null, userId)}>
          <input name="accessState" type="hidden" value={nextAccessState} />
          <PendingAccessSubmit accessState={accessState} />
        </form>
      ) : null}
    </div>
  )
}

function PendingStatusSubmit() {
  const { pending } = useFormStatus()
  return (
    <Button
      aria-label={pending ? 'Saving Member Status' : 'Save Member Status'}
      disabled={pending}
      size="icon-sm"
      type="submit"
      variant="outline"
    >
      <SaveIcon />
    </Button>
  )
}

function PendingAccessSubmit({ accessState }: { accessState: AccountAccessState }) {
  const { pending } = useFormStatus()
  const disabling = accessState === 'enabled'
  const label = disabling ? 'Disable access' : 'Enable access'
  return (
    <Button disabled={pending} size="sm" type="submit" variant={disabling ? 'destructive' : 'outline'}>
      {disabling ? <LockIcon data-icon="inline-start" /> : <UnlockIcon data-icon="inline-start" />}
      {pending ? `${label}…` : label}
    </Button>
  )
}

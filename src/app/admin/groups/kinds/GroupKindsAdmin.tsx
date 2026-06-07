import type { Group, GroupKind } from '@/common/groups/types'

import { CreateGroupKindCard } from './CreateGroupKindCard'
import { GroupKindsTable } from './GroupKindsTable'

export function GroupKindsAdmin({
  groupKinds,
  groups,
  isPending,
  error,
  onKindsChanged,
}: {
  groupKinds: GroupKind[]
  groups: Group[]
  isPending: boolean
  error: unknown
  onKindsChanged: () => Promise<unknown>
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <CreateGroupKindCard onChanged={onKindsChanged} />
      <GroupKindsTable
        groupKinds={groupKinds}
        groups={groups}
        isPending={isPending}
        error={error}
        onChanged={onKindsChanged}
      />
    </div>
  )
}

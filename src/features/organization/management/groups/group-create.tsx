import type { Group } from '@/prisma/generated/client'
import type { GroupFormAction } from './group-form'
import { CreateGroupForm } from './group-form'

export function GroupCreate({
  groups,
  action,
  showHeading = true,
}: {
  groups: Group[]
  action: GroupFormAction
  showHeading?: boolean
}) {
  return (
    <section className="mx-auto w-full max-w-xl space-y-6">
      {showHeading ? (
        <header className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Groups</p>
          <h1 className="text-3xl font-semibold tracking-tight">Create Group</h1>
          <p className="text-muted-foreground">Add a durable organizational Group.</p>
        </header>
      ) : (
        <p className="text-muted-foreground">Add a durable organizational Group.</p>
      )}
      <div className="rounded-lg border p-4 sm:p-6">
        <CreateGroupForm action={action} groups={groups} />
      </div>
    </section>
  )
}

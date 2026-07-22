import type { Group } from '@/prisma/generated/client'
import { CreatePositionForm } from './position-form'
export function PositionCreate({ groups, showHeading = true }: { groups: Group[]; showHeading?: boolean }) {
  return (
    <section className="mx-auto w-full max-w-xl space-y-6">
      {showHeading ? (
        <header className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Positions</p>
          <h1 className="text-3xl font-semibold tracking-tight">Create Position</h1>
          <p className="text-muted-foreground">Add a durable choir Position and its Group scopes.</p>
        </header>
      ) : (
        <p className="text-muted-foreground">Add a durable choir Position and its Group scopes.</p>
      )}
      <div className="rounded-lg border p-4 sm:p-6">
        <CreatePositionForm groups={groups} />
      </div>
    </section>
  )
}

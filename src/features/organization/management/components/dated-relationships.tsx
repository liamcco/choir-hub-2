import type { ReactNode } from 'react'
import type { DatedRelationship as CoreDatedRelationship } from '@/features/organization/core/dated-history'
import { formatDate } from '@/shared/formatting'

export type DatedRelationship = CoreDatedRelationship & { label: string; detail?: ReactNode }

export function DatedRelationships({
  title,
  relationships,
  empty = 'None recorded.',
}: {
  title: string
  relationships: DatedRelationship[]
  empty?: string
}) {
  return (
    <section aria-label={title} className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {relationships.length ? (
        <ol className="divide-y rounded-lg border">
          {relationships.map((relationship) => (
            <li
              className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"
              key={relationship.id}
            >
              <div>
                <p className="font-medium">{relationship.label}</p>
                {relationship.detail ? <p className="text-sm text-muted-foreground">{relationship.detail}</p> : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(relationship.startsAt)} –{' '}
                {relationship.endsAt ? formatDate(relationship.endsAt) : 'Present'}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">{empty}</p>
      )}
    </section>
  )
}

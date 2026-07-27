import Link from 'next/link'
import type { PlacementUser } from './query'

export function PlacementRoster({ users, query }: { users: PlacementUser[]; query: string }) {
  const groups = [
    ['ACTIVE', 'Active'],
    ['PASSIVE', 'Passive'],
    ['FORMER', 'Former'],
  ] as const
  return (
    <div className="space-y-8">
      {groups.map(([status, label]) => {
        const entries = users.filter((user) => user.status === status)
        return (
          <section
            aria-labelledby={`placement-${status.toLowerCase()}`}
            className={status === 'FORMER' ? 'opacity-60' : ''}
            key={status}
          >
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h2 className="font-heading text-lg font-semibold" id={`placement-${status.toLowerCase()}`}>
                {label}
              </h2>
              <span className="text-sm text-muted-foreground">{entries.length}</span>
            </div>
            {entries.length ? (
              <div className="divide-y rounded-xl border">
                {entries.map((user) => (
                  <Link
                    className="flex items-center justify-between gap-4 px-4 py-2.5 hover:bg-muted/50"
                    href={`/admin/placement?${query}&detail=${encodeURIComponent(user.id)}`}
                    key={user.id}
                  >
                    <span className="min-w-0 truncate font-medium">{user.name}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="hidden text-sm text-muted-foreground sm:inline">{user.voice ?? 'No Voice'}</span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
                No {label.toLowerCase()} Users here.
              </p>
            )}
          </section>
        )
      })}
    </div>
  )
}

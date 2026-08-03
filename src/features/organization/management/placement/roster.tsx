import Link from 'next/link'
import type { Choir, Section } from '@/core/topology'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { sortPlacementUsers, visiblePlacementUsers } from './model'
import type { PlacementUser } from './query'
import { UnassignedDialog } from './unassigned-dialog'

export function PlacementRoster({
  area,
  choirs,
  sections,
  users,
  query,
}: {
  area: string
  choirs: readonly Choir[]
  sections: readonly Section[]
  users: PlacementUser[]
  query: string
}) {
  if (area === 'others') {
    return <OthersOverview choirs={choirs} users={users} query={query} />
  }

  const choir = choirs.find((candidate) => candidate.id === area)
  if (!choir) return null
  const choirSections = sections.filter((section) => section.choirId === choir.id)
  const unassigned = visiblePlacementUsers(users.filter((user) => user.choirId === choir.id && !user.sectionId))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-xl font-semibold">{choir.name}</h2>
        <UnassignedDialog users={unassigned} query={query} />
      </div>
      <div className="-mx-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:px-0 sm:snap-none">
        <div className="flex gap-3">
          {choirSections.map((section) => (
            <div className="min-w-0 w-[calc(100vw-2rem)] shrink-0 sm:w-[calc((100%_-_2.25rem)/4)]" key={section.id}>
              <PlacementTable
                title={section.name}
                count={users.filter((user) => user.sectionId === section.id && user.status === 'ACTIVE').length}
                users={users.filter((user) => user.sectionId === section.id)}
                query={query}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OthersOverview({ choirs, users, query }: { choirs: readonly Choir[]; users: PlacementUser[]; query: string }) {
  const columns = [
    { id: 'no-home-choir', title: 'No home choir', users: users.filter((user) => !user.choirId) },
    ...choirs.map((choir) => ({
      id: choir.id,
      title: choir.shortName,
      users: users.filter((user) => user.choirId === choir.id && !user.sectionId),
    })),
  ]
  const visibleColumns = columns.map((column) => ({ ...column, users: visiblePlacementUsers(column.users) }))

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-semibold">Incomplete placement</h2>
      <div className="-mx-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:px-0 sm:snap-none">
        <div className="flex gap-3">
          {visibleColumns.map((column) => (
            <div className="min-w-0 w-[calc(100vw-2rem)] shrink-0 sm:w-[calc((100%_-_2.25rem)/4)]" key={column.id}>
              <PlacementTable title={column.title} count={column.users.length} users={column.users} query={query} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PlacementTable({
  title,
  count,
  users,
  query,
}: {
  title: string
  count: number
  users: PlacementUser[]
  query: string
}) {
  const entries = sortPlacementUsers(visiblePlacementUsers(users))
  return (
    <section className="min-w-0 snap-center" aria-labelledby={`placement-table-${title}`}>
      <h3 className="mb-3 truncate font-heading text-base font-semibold" id={`placement-table-${title}`}>
        {title} ({count})
      </h3>
      <div className="overflow-hidden rounded-lg border">
        <Table className="whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Voice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length ? (
              entries.map((user) => (
                <TableRow
                  className={
                    user.status === 'PASSIVE' ? 'bg-muted/40 text-muted-foreground opacity-75 hover:bg-muted/60' : ''
                  }
                  key={user.id}
                >
                  <TableCell className="relative max-w-0 truncate font-medium">
                    <Link
                      className="after:absolute after:inset-0 hover:underline focus-visible:underline"
                      href={`/admin/placement?${query}&detail=${encodeURIComponent(user.id)}`}
                    >
                      {user.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{user.voice ?? '—'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-20 text-center text-muted-foreground" colSpan={2}>
                  No singers
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

import { IdCard } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { formatDate } from '../_lib/format'
import { getUserPositions } from '../_lib/profile-data'
import { getProfileSessionOrRedirect } from '../_lib/session'

export async function PositionsCard() {
  const { session } = await getProfileSessionOrRedirect()
  const positions = await getUserPositions(session.user.id)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Positions</CardTitle>
        <CardDescription>The roles currently assigned to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {positions.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {positions.map((position) => (
              <li className="flex gap-3 px-3 py-3" key={position.id}>
                <IdCard className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="truncate text-sm font-medium">{position.name}</p>
                    {position.heldSince ? (
                      <p className="text-xs text-muted-foreground">Held since {formatDate(position.heldSince)}</p>
                    ) : null}
                  </div>

                  {position.description ? (
                    <p className="text-sm text-muted-foreground">{position.description}</p>
                  ) : null}

                  {position.groups.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {position.groups.map(({ group }) => (
                        <span
                          className="rounded-md border bg-muted/30 px-2 py-1 text-xs text-muted-foreground"
                          key={group.id}
                        >
                          {group.parentGroup ? `${group.parentGroup.name} / ` : null}
                          {group.name} · {group.kind.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
            You do not hold any positions yet.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

import { UsersRound } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { formatDate } from '../_lib/format'
import { getUserGroupMemberships } from '../_lib/profile-data'
import { getProfileSessionOrRedirect } from '../_lib/session'

export async function GroupsCard() {
  const { session } = await getProfileSessionOrRedirect()
  const memberships = await getUserGroupMemberships(session.user.id)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Groups</CardTitle>
        <CardDescription>The groups connected to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {memberships.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {memberships.map((membership) => (
              <li className="flex gap-3 px-3 py-3" key={membership.id}>
                <UsersRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="truncate text-sm font-medium">{membership.group.name}</p>
                    <p className="text-xs text-muted-foreground">{membership.group.kind.name}</p>
                  </div>

                  {membership.group.description ? (
                    <p className="text-sm text-muted-foreground">{membership.group.description}</p>
                  ) : null}

                  <p className="text-xs text-muted-foreground">
                    {membership.group.parentGroup ? `${membership.group.parentGroup.name} / ` : null}
                    Added {formatDate(membership.addedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
            You are not part of any groups yet.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

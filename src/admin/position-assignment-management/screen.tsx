import { CreatePositionAssignmentForm } from '@/admin/position-assignment-management/assignment-form'
import {
  MemberPositionSectionsCard,
  PositionHolderSectionsCard,
} from '@/admin/position-assignment-management/assignment-sections'
import { listPositionAssignmentManagement } from '@/admin/position-assignment-management/service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export async function PositionAssignmentManagementScreen() {
  const state = await listPositionAssignmentManagement()
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-normal">Position Assignments</h1>
        <p className="text-muted-foreground text-sm">Dated Member holders for Positions</p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(18rem,24rem)_1fr] xl:items-start">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Assign Position</CardTitle>
            <CardDescription>Choose a Position, Member, and start date</CardDescription>
          </CardHeader>
          <CardContent>
            <CreatePositionAssignmentForm members={state.members} positions={state.positions} />
          </CardContent>
        </Card>

        <PositionHolderSectionsCard positionViews={state.positionViews} />
      </section>

      <MemberPositionSectionsCard memberViews={state.memberViews} />
    </main>
  )
}

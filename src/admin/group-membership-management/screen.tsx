import { CreateGroupMembershipForm } from '@/admin/group-membership-management/membership-form'
import {
  GroupMembershipSectionsCard,
  MemberGroupMembershipSectionsCard,
} from '@/admin/group-membership-management/membership-sections'
import { listGroupMembershipManagement } from '@/admin/group-membership-management/service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export async function GroupMembershipManagementScreen() {
  const state = await listGroupMembershipManagement()
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-normal">Group Memberships</h1>
        <p className="text-muted-foreground text-sm">Dated Member periods in Groups</p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(18rem,24rem)_1fr] xl:items-start">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Add Member to Group</CardTitle>
            <CardDescription>Choose a Member, Group, and start date</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateGroupMembershipForm groups={state.groups} members={state.members} />
          </CardContent>
        </Card>

        <GroupMembershipSectionsCard groupViews={state.groupViews} />
      </section>

      <MemberGroupMembershipSectionsCard groups={state.groups} memberViews={state.memberViews} />
    </main>
  )
}

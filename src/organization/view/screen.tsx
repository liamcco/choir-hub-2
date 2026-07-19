import { KeyRoundIcon } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { GroupHierarchySection } from '@/organization/view/group-hierarchy-section'
import { MemberHistorySection } from '@/organization/view/member-sections'
import { PositionHistorySection } from '@/organization/view/position-sections'
import { listOrganizationalReadOnly } from '@/organization/view/service'

export async function OrganizationalReadOnlyScreen() {
  const state = await listOrganizationalReadOnly()
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl tracking-normal">Organization</h1>
          <p className="text-muted-foreground text-sm">Groups, Members, Positions, and dated history</p>
        </div>
        <Link href="/account" className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-fit' })}>
          <KeyRoundIcon data-icon="inline-start" />
          Account
        </Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(18rem,24rem)_1fr] xl:items-start">
        <GroupHierarchySection groupCount={state.groups.length} groupHierarchy={state.groupHierarchy} />
        <MemberHistorySection memberViews={state.memberViews} />
      </section>

      <PositionHistorySection positionViews={state.positionViews} />
    </main>
  )
}

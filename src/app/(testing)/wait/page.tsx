import { PageShell } from '@/components/layout/page-shell'
import { Suspense } from 'react'
import { MyServerResources, MyServerResourcesSkeleton } from './MyServerResources'
import { MySession, MySessionSkeleton } from './MySession'

export default async function Posts() {
  // Demonstrate Loading, then suspense for multiple components.
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Suspense does not start until above promise is resolved, so the loading UI will show for 3 seconds, then both components will suspend until they are ready.
  return (
    <PageShell size="narrow" className="space-y-4">
      <Suspense fallback={<MySessionSkeleton />}>
        <MySession />
      </Suspense>
      <Suspense fallback={<MyServerResourcesSkeleton />}>
        <MyServerResources />
      </Suspense>
    </PageShell>
  )
}

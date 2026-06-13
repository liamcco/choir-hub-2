import { PageShell } from '@/components/layout/page-shell'
import { Suspense } from 'react'
import { LoginCard, LoginCardSkeleton } from './login-card'

export default async function LoginPage() {
  return (
    <PageShell size="narrow" className="py-16 sm:py-20">
      <Suspense fallback={<LoginCardSkeleton />}>
        <LoginCard />
      </Suspense>
    </PageShell>
  )
}

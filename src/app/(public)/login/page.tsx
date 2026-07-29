import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginScreen } from '@/features/account/login'
import { Spinner } from '@/shared/ui/spinner'

export const metadata: Metadata = {
  title: 'Sign in · CSK Choir Hub',
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  )
}

async function LoginContent({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const returnTo = (await searchParams).returnTo
  return <LoginScreen returnTo={returnTo} />
}

function LoginFallback() {
  return (
    <LoginScreen>
      <div className="flex h-60 items-center justify-center" aria-busy="true">
        <Spinner />
      </div>
    </LoginScreen>
  )
}

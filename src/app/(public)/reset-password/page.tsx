import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PasswordResetScreen } from '@/features/account/password-reset'
import { Spinner } from '@/shared/ui/spinner'

export const metadata: Metadata = {
  title: 'Choose a new password · CSK Choir Hub',
}

export default function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  )
}

async function ResetPasswordContent({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const token = (await searchParams).token
  return <PasswordResetScreen token={typeof token === 'string' ? token : undefined} />
}

function ResetPasswordFallback() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl tracking-normal">Choose a new password</h1>
          <p className="text-muted-foreground text-sm">Loading your password reset link...</p>
        </div>
        <div className="flex h-24 items-center justify-center" aria-busy="true">
          <Spinner />
        </div>
      </div>
    </main>
  )
}

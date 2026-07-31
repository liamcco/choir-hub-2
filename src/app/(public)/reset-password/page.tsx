import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PasswordResetLoadingScreen, PasswordResetScreen } from '@/features/account/password-reset'

export const metadata: Metadata = {
  title: 'Choose a new password · CSK Choir Hub',
}

export default function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  return (
    <Suspense fallback={<PasswordResetLoadingScreen />}>
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  )
}

async function ResetPasswordContent({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const token = (await searchParams).token
  return <PasswordResetScreen token={typeof token === 'string' ? token : undefined} />
}

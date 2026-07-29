import type { Metadata } from 'next'
import { PasswordResetScreen } from '@/features/account/password-reset'

export const metadata: Metadata = {
  title: 'Choose a new password · CSK Choir Hub',
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const token = (await searchParams).token
  return <PasswordResetScreen token={typeof token === 'string' ? token : undefined} />
}

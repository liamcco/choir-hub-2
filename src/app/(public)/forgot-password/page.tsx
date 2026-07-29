import type { Metadata } from 'next'
import { PasswordResetRequestScreen } from '@/features/account/password-reset'

export const metadata: Metadata = {
  title: 'Reset your password · CSK Choir Hub',
}

export default function ForgotPasswordPage() {
  return <PasswordResetRequestScreen />
}

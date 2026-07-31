'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ROUTES } from '@/core/navigation/site'
import { Button } from '@/shared/ui/button'
import { PasswordResetForm } from './password-reset-form'
import { PasswordResetRequestForm } from './password-reset-request-form'
import { PasswordResetScreenLayout } from './password-reset-screen-layout'

export function PasswordResetRequestScreen() {
  const [isComplete, setIsComplete] = useState(false)

  return (
    <PasswordResetScreenLayout
      title={isComplete ? 'Check your email' : 'Reset your password'}
      description={
        isComplete
          ? 'If an account exists for that email, you’ll receive a reset link shortly.'
          : 'Enter your account email and we’ll send you a password reset link.'
      }
    >
      {isComplete ? (
        <div role="status">
          <Link href={ROUTES.login} className="text-sm underline underline-offset-4">
            Return to sign in
          </Link>
        </div>
      ) : (
        <PasswordResetRequestForm onSuccess={() => setIsComplete(true)} />
      )}
    </PasswordResetScreenLayout>
  )
}

export function PasswordResetScreen({ token }: { token?: string }) {
  const router = useRouter()
  const [isComplete, setIsComplete] = useState(false)

  return (
    <PasswordResetScreenLayout
      title={isComplete ? 'Password reset' : 'Choose a new password'}
      description={isComplete ? 'Your password has been updated.' : 'Enter and confirm your new password.'}
    >
      {isComplete ? (
        <Button type="button" onClick={() => router.replace(ROUTES.login)}>
          Return to sign in
        </Button>
      ) : (
        <PasswordResetForm token={token} onSuccess={() => setIsComplete(true)} />
      )}
    </PasswordResetScreenLayout>
  )
}

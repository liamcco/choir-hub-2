import { Spinner } from '@/shared/ui/spinner'
import { PasswordResetScreenLayout } from './password-reset-screen-layout'

export function PasswordResetLoadingScreen() {
  return (
    <PasswordResetScreenLayout title="Choose a new password" description="Loading your password reset link...">
      <div className="flex h-24 items-center justify-center" aria-busy="true">
        <Spinner />
      </div>
    </PasswordResetScreenLayout>
  )
}

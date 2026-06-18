import { CheckCircle2 } from 'lucide-react'

import { EmailVerificationControls } from './email-verification-controls'

type EmailVerificationFormProps = {
  email: string
  emailVerified: boolean
}

export function EmailVerificationForm({ email, emailVerified }: EmailVerificationFormProps) {
  if (emailVerified) {
    return <VerifiedEmailNotice email={email} />
  }

  return (
    <div className="rounded-lg border border-dashed p-3">
      <EmailVerificationControls>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium">Email not verified</p>
          <p className="wrap-break-word text-sm text-muted-foreground">{email}</p>
        </div>
      </EmailVerificationControls>
    </div>
  )
}

function VerifiedEmailNotice({ email }: { email: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium">Email verified</p>
          <p className="wrap-break-word text-sm text-muted-foreground">{email}</p>
        </div>
      </div>
    </div>
  )
}

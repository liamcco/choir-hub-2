import { CheckCircle2 } from 'lucide-react'

import { UsernameClaimForm } from './username-claim-form'

type UsernameFormProps = {
  displayUsername: string | null
  username: string | null
}

export function UsernameForm({ displayUsername, username }: UsernameFormProps) {
  if (username) {
    return (
      <div className="rounded-lg border bg-muted/30 p-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium">Username set</p>
            <p className="wrap-break-word text-sm text-muted-foreground">{displayUsername || username}</p>
          </div>
        </div>
      </div>
    )
  }

  return <UsernameClaimForm />
}

import { KeyRound } from 'lucide-react'
import type { Passkey } from '@better-auth/passkey/client'

import { formatPasskeyMeta } from '../_lib/format'
import { PasskeyAddForm } from './passkey-add-form'

type PasskeyManagerProps = {
  passkeys: Passkey[]
}

export function PasskeyManager({ passkeys }: PasskeyManagerProps) {
  return (
    <div className="space-y-6">
      <PasskeyAddForm />
      <PasskeyList passkeys={passkeys} />
    </div>
  )
}

function PasskeyList({ passkeys }: PasskeyManagerProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Your passkeys</h3>
      {passkeys.length > 0 ? (
        <ul className="divide-y rounded-lg border">
          {passkeys.map((passkey) => (
            <li className="flex items-center justify-between gap-4 px-3 py-3" key={passkey.id}>
              <div className="flex min-w-0 items-center gap-3">
                <KeyRound className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{passkey.name || 'Unnamed passkey'}</p>
                  <p className="text-xs text-muted-foreground">{formatPasskeyMeta(passkey)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
          No passkeys have been added yet.
        </p>
      )}
    </div>
  )
}

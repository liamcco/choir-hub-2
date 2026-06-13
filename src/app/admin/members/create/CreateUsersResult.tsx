import { CreateUsersResponse } from '@/lib/api-client'

export function CreateResult({ result }: { result?: CreateUsersResponse }) {
  if (!result) {
    return null
  }

  const total = result.succeeded.length + result.skipped.length + result.failed.length

  if (!total) {
    return null
  }

  return (
    <div className="mt-4 space-y-2 text-sm">
      <p className="font-medium text-green-700">
        Created {result.succeeded.length}. Skipped {result.skipped.length}. Failed {result.failed.length}.
      </p>
      {result.skipped.length ? (
        <p className="text-muted-foreground">Skipped: {result.skipped.map((user) => user.email).join(', ')}</p>
      ) : null}
      {result.failed.length ? (
        <p className="text-destructive">
          Failed: {result.failed.map((user) => `${user.email} (${user.message})`).join(', ')}
        </p>
      ) : null}
    </div>
  )
}

import { ProvisionPeopleResponse } from '@/lib/api-client'

export function ProvisionResult({ result }: { result?: ProvisionPeopleResponse }) {
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
        <p className="text-muted-foreground">Skipped: {result.skipped.map((person) => person.email).join(', ')}</p>
      ) : null}
      {result.failed.length ? (
        <p className="text-destructive">
          Failed: {result.failed.map((person) => `${person.email} (${person.message})`).join(', ')}
        </p>
      ) : null}
    </div>
  )
}

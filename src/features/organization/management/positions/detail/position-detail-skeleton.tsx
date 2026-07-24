export function PositionDetailSkeleton() {
  return (
    <div aria-busy="true" className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="h-48 animate-pulse rounded-lg bg-muted" />
    </div>
  )
}

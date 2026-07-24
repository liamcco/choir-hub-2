export function MemberDetailSkeleton() {
  return (
    <div aria-busy="true" className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="space-y-3 border-b pb-6">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="h-20 animate-pulse rounded-lg bg-muted" key={index} />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-lg bg-muted" />
    </div>
  )
}

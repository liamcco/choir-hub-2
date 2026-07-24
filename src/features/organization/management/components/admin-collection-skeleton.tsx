import { Skeleton } from '@/shared/ui/skeleton'

export function AdminCollectionSkeleton({ title, columnCount }: { title: string; columnCount: number }) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-8 lg:py-12">
      <header className="flex flex-col gap-5 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-2xl space-y-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>
      </header>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-9 w-full max-w-sm" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div aria-label={`Loading ${title}`} className="overflow-hidden rounded-lg border" role="status">
          <div
            className="grid gap-4 border-b p-4"
            style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columnCount }, (_, index) => (
              <Skeleton className="h-4" key={index} />
            ))}
          </div>
          <div className="divide-y">
            {Array.from({ length: 8 }, (_, rowIndex) => (
              <div
                className="grid gap-4 p-4"
                key={rowIndex}
                style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: columnCount }, (_, columnIndex) => (
                  <Skeleton className="h-5" key={columnIndex} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

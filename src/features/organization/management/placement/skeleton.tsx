import { Skeleton } from '@/shared/ui/skeleton'

export function PlacementSkeleton() {
  return (
    <div aria-busy="true" className="space-y-6">
      <Skeleton aria-label="Loading Placement search" className="h-9 w-full max-w-xl" role="status" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="border-t pt-6">
        <div className="space-y-6">
          {(
            [
              ['w-20', 4],
              ['w-24', 2],
              ['w-20', 2],
            ] as const
          ).map(([headingWidth, rowCount], sectionIndex) => (
            <section
              aria-label={`Loading Placement roster ${sectionIndex + 1}`}
              className="space-y-3"
              key={sectionIndex}
            >
              <div className="flex items-center justify-between">
                <Skeleton className={`h-5 ${headingWidth}`} />
                <Skeleton className="h-4 w-6" />
              </div>
              <div className="divide-y rounded-xl border">
                {Array.from({ length: rowCount }, (_, rowIndex) => (
                  <div className="flex items-center justify-between gap-4 px-4 py-3" key={rowIndex}>
                    <Skeleton className={`h-5 ${rowIndex % 2 ? 'w-44' : 'w-36'}`} />
                    <Skeleton className="h-5 w-12" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

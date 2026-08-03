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
        <div className="flex gap-3 overflow-hidden sm:grid sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, sectionIndex) => (
            <section
              aria-label={`Loading Placement section ${sectionIndex + 1}`}
              className="w-[calc(100vw-2rem)] shrink-0 space-y-3 sm:w-auto"
              key={sectionIndex}
            >
              <Skeleton className="h-5 w-20" />
              <div className="divide-y rounded-xl border">
                {Array.from({ length: 3 }, (_, rowIndex) => (
                  <div className="flex items-center justify-between gap-4 px-3 py-3" key={rowIndex}>
                    <Skeleton className={`h-5 ${rowIndex % 2 ? 'w-44' : 'w-36'}`} />
                    <Skeleton className="h-5 w-8" />
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

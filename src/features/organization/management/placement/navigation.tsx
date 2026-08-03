import Link from 'next/link'
import type { Choir } from '@/core/topology'
import { Button } from '@/shared/ui/button'

export function PlacementNavigation({
  choirs,
  selected,
  counts,
}: {
  choirs: readonly Choir[]
  selected?: string
  counts: Map<string, number>
}) {
  return (
    <nav aria-label="Placement areas" className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {choirs.map((choir) => (
          <Link href={`/admin/placement?area=${choir.id}`} key={choir.id}>
            <Button variant={selected === choir.id ? 'default' : 'outline'}>
              {choir.shortName} <span className="ml-1 text-xs opacity-70">{counts.get(choir.id) ?? 0}</span>
            </Button>
          </Link>
        ))}
        <Link href="/admin/placement?area=others">
          <Button variant={selected === 'others' ? 'default' : 'outline'}>
            OTHERS <span className="ml-1 text-xs opacity-70">{counts.get('others') ?? 0}</span>
          </Button>
        </Link>
      </div>
    </nav>
  )
}

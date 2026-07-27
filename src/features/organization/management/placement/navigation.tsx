import Link from 'next/link'
import type { Choir, Section } from '@/core/topology'
import { Button } from '@/shared/ui/button'

export function PlacementNavigation({
  choirs,
  sections,
  selected,
  selectedSection,
  counts,
}: {
  choirs: readonly Choir[]
  sections: readonly Section[]
  selected?: string
  selectedSection?: string
  counts: Map<string, number>
}) {
  return (
    <nav aria-label="Placement areas" className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/placement">
          <Button variant={!selected ? 'default' : 'outline'}>All Users</Button>
        </Link>
        {choirs.map((choir) => (
          <Link href={`/admin/placement?area=${choir.id}`} key={choir.id}>
            <Button variant={selected === choir.id ? 'default' : 'outline'}>
              {choir.shortName} <span className="ml-1 text-xs opacity-70">{counts.get(choir.id) ?? 0}</span>
            </Button>
          </Link>
        ))}
        <Link href="/admin/placement?area=others">
          <Button variant={selected === 'others' || selected?.startsWith('others-') ? 'default' : 'outline'}>
            OTHERS <span className="ml-1 text-xs opacity-70">{counts.get('others') ?? 0}</span>
          </Button>
        </Link>
      </div>
      {selected && choirs.some((choir) => choir.id === selected) ? (
        <div className="flex flex-wrap gap-2 border-l-2 pl-3">
          {sections
            .filter((section) => section.choirId === selected)
            .map((section) => (
              <Link href={`/admin/placement?area=${selected}&section=${section.id}`} key={section.id}>
                <Button size="sm" variant={section.id === selectedSection ? 'default' : 'outline'}>
                  {section.name} <span className="ml-1 text-xs opacity-70">{counts.get(section.id) ?? 0}</span>
                </Button>
              </Link>
            ))}
        </div>
      ) : null}
      {selected === 'others' || selected?.startsWith('others-') ? (
        <div className="flex flex-wrap gap-2 border-l-2 pl-3">
          <Link href="/admin/placement?area=others-no-section">
            <Button size="sm" variant={selected === 'others-no-section' ? 'default' : 'outline'}>
              No Section <span className="ml-1 text-xs opacity-70">{counts.get('others-no-section') ?? 0}</span>
            </Button>
          </Link>
          <Link href="/admin/placement?area=others-no-choir">
            <Button size="sm" variant={selected === 'others-no-choir' ? 'default' : 'outline'}>
              No Home Choir <span className="ml-1 text-xs opacity-70">{counts.get('others-no-choir') ?? 0}</span>
            </Button>
          </Link>
        </div>
      ) : null}
    </nav>
  )
}

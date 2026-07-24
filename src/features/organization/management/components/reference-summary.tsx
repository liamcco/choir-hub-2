import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export type ReferenceSummaryItem = { label: string; value: ReactNode }

export function ReferenceSummary({
  title = 'Reference information',
  items,
}: {
  title?: string
  items: ReferenceSummaryItem[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-sm text-muted-foreground">{item.label}</dt>
            <dd className="font-medium">{item.value}</dd>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

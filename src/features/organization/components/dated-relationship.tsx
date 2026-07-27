import { CalendarRangeIcon } from 'lucide-react'
import { formatDate } from '@/shared/formatting'

export function DatedRelationship({ startsAt, endsAt }: { startsAt: Date; endsAt?: Date | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <CalendarRangeIcon className="size-4 text-muted-foreground" aria-hidden="true" />
      {formatDate(startsAt)} {endsAt ? `to ${formatDate(endsAt)}` : 'onward'}
    </span>
  )
}

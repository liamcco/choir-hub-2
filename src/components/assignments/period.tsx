import { CalendarRangeIcon } from 'lucide-react'

export function Period({ startsAt, endsAt }: { startsAt: Date; endsAt?: Date | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <CalendarRangeIcon className="size-4 text-muted-foreground" aria-hidden="true" />
      {formatDate(startsAt)} {endsAt ? `to ${formatDate(endsAt)}` : 'onward'}
    </span>
  )
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}

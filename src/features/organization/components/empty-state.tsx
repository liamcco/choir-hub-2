export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
      {label}
    </div>
  )
}

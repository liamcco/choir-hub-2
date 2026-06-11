export const selectClassName =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30'

export function FormError({ error }: { error: string | null }) {
  if (!error) {
    return null
  }

  return <p className="mt-4 text-sm text-destructive">{error}</p>
}

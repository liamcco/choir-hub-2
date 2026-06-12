export function FormError({ error }: { error: string | null }) {
  if (!error) {
    return null
  }

  return <p className="mt-4 text-sm text-destructive">{error}</p>
}

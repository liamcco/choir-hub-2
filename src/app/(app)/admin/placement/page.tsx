import { PlacementManagementScreen } from '@/features/organization/management'

export default async function AdminPlacementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return <PlacementManagementScreen searchParams={searchParams} />
}

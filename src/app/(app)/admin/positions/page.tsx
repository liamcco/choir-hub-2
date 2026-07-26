import { PositionManagementScreen } from '@/features/organization/management/positions'

export default async function AdminPositionsPage({
  searchParams,
}: {
  searchParams: Promise<{ detail?: string | string[] }>
}) {
  return <PositionManagementScreen searchParams={searchParams} />
}

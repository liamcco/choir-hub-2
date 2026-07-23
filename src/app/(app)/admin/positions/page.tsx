import { PositionManagementScreen } from '@/features/organization/management/positions'

export const instant = false

export default async function AdminPositionsPage({
  searchParams,
}: {
  searchParams: Promise<{ detail?: string | string[] }>
}) {
  const detail = (await searchParams).detail
  return <PositionManagementScreen detailId={typeof detail === 'string' ? detail : undefined} />
}

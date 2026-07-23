import { GroupManagementScreen } from '@/features/organization/management/groups'

export const instant = false

export default async function AdminGroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ detail?: string | string[] }>
}) {
  const detail = (await searchParams).detail
  return <GroupManagementScreen detailId={typeof detail === 'string' ? detail : undefined} />
}

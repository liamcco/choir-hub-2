import { GroupManagementScreen } from '@/features/organization/management/groups'

export default async function AdminGroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ detail?: string | string[] }>
}) {
  return <GroupManagementScreen searchParams={searchParams} />
}

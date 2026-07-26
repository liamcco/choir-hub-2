import { UserManagementScreen } from '@/features/organization/management/members'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ detail?: string | string[] }>
}) {
  return <UserManagementScreen searchParams={searchParams} />
}

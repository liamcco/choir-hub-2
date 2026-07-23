import { UserManagementScreen } from '@/features/organization/management/members'

export const instant = false

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ detail?: string | string[] }>
}) {
  const detail = (await searchParams).detail
  return <UserManagementScreen detailId={typeof detail === 'string' ? detail : undefined} />
}

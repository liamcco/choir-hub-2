import { MemberManagementScreen } from '@/features/organization/management/members'

export const instant = false

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ detail?: string | string[] }>
}) {
  const detail = (await searchParams).detail
  return <MemberManagementScreen detailId={typeof detail === 'string' ? detail : undefined} />
}

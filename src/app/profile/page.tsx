import { PageHeader, PageShell } from '@/components/layout/page-shell'

import { ProfileTabs } from './_components/profile-tabs'

export default function ProfilePage() {
  return (
    <PageShell size="content">
      <PageHeader title="Profile" description="Review your account, groups, positions, and security settings." />
      <ProfileTabs />
    </PageShell>
  )
}

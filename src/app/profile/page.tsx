import { PageHeader, PageShell } from '@/components/layout/page-shell'

import { ProfileTabs } from './_components/profile-tabs'

export default function ProfilePage() {
  return (
    <PageShell size="content">
      <PageHeader title="Profile" description="Manage your account identity and sign-in options." />
      <ProfileTabs />
    </PageShell>
  )
}

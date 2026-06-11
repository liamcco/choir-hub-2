import { PageHeader, PageShell } from '@/components/layout/page-shell';

import { AdminPeoplePanel } from './AdminPeoplePanel';

export default function AdminPage() {
  return (
    <PageShell size="wide">
      <PageHeader title="Admin" description="Provision and manage application persons." />
      <AdminPeoplePanel />
    </PageShell>
  );
}

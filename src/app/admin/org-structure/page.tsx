import { PageHeader, PageShell } from '@/components/layout/page-shell'

import { OrgStructurePagePanel } from './OrgStructurePagePanel'

export default function AdminOrgStructurePage() {
  return (
    <PageShell size="wide">
      <PageHeader title="Org Structure" description="Inspect group hierarchy, effective member counts, and positions." />
      <OrgStructurePagePanel />
    </PageShell>
  )
}

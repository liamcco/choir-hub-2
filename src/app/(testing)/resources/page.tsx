import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { ResourceContainer } from './ResourceContainer'

export default async function ResourcesPage() {
  return (
    <PageShell size="wide">
      <PageHeader title="Resources" description="List of protected resources" />
      <ResourceContainer />
    </PageShell>
  )
}

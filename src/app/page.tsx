import { PageShell } from '@/components/layout/page-shell'

export default async function HomePage() {
  return (
    <PageShell size="content" className="py-16 text-center sm:py-20">
      <h1 className="text-2xl font-bold">Welcome to CSK Choir Hub</h1>
      <p>You can only see this content if you are signed in.</p>
    </PageShell>
  )
}

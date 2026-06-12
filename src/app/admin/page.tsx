import Link from 'next/link'
import { BriefcaseBusiness, FolderTree, Layers, Users } from 'lucide-react'

import { PageHeader, PageShell } from '@/components/layout/page-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const adminSections = [
  {
    title: 'Members',
    description: 'Provision and review application people.',
    href: '/admin/members',
    icon: Users,
  },
  {
    title: 'Groups',
    description: 'Create groups and inspect the organization structure.',
    href: '/admin/groups',
    icon: FolderTree,
  },
  {
    title: 'Group Kinds',
    description: 'Manage the controlled list of group classifications.',
    href: '/admin/groups/kinds',
    icon: Layers,
  },
  {
    title: 'Positions',
    description: 'Create positions and assign current holders.',
    href: '/admin/positions',
    icon: BriefcaseBusiness,
  },
]

export default function AdminPage() {
  return (
    <PageShell size="wide">
      <PageHeader title="Admin" description="Manage members, groups, group kinds, and positions." />
      <div className="grid gap-4 md:grid-cols-2">
        {adminSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon />
                  {section.title}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-primary">Open</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageShell>
  )
}

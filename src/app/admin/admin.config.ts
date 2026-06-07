import { BriefcaseBusiness, FolderTree, GitFork, Users } from 'lucide-react'

export const adminSections = [
  {
    title: 'Members',
    description: 'Create and review application users.',
    href: '/admin/members',
    icon: Users,
  },
  {
    title: 'Groups',
    description: 'Create groups and manage memberships.',
    href: '/admin/groups',
    icon: FolderTree,
  },
  {
    title: 'Org Structure',
    description: 'Inspect the full group hierarchy with positions and effective member counts.',
    href: '/admin/org-structure',
    icon: GitFork,
  },
  {
    title: 'Positions',
    description: 'Create positions and assign current holders.',
    href: '/admin/positions',
    icon: BriefcaseBusiness,
  },
]

import { BriefcaseBusiness, FolderTree, Users } from 'lucide-react'

export const adminSections = [
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
    title: 'Positions',
    description: 'Create positions and assign current holders.',
    href: '/admin/positions',
    icon: BriefcaseBusiness,
  },
]

import type { MemberStatus } from '@/prisma/generated/client'

export function formatMemberStatus(status: MemberStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'Active'
    case 'PASSIVE':
      return 'Passive'
    case 'FORMER':
      return 'Former'
  }
}

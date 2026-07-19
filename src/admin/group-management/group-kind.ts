import type { GroupKind } from '@/prisma/generated/client'

export const groupKindOptions = [
  'CHOIR',
  'SECTION',
  'COMMITTEE',
  'BOARD',
  'PROJECT',
] as const satisfies readonly GroupKind[]

export const defaultGroupKind = 'SECTION' satisfies GroupKind

export function formatGroupKind(kind: GroupKind) {
  switch (kind) {
    case 'CHOIR':
      return 'Choir'
    case 'SECTION':
      return 'Section'
    case 'COMMITTEE':
      return 'Committee'
    case 'BOARD':
      return 'Board'
    case 'PROJECT':
      return 'Project'
  }
}

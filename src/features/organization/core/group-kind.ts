import type { GroupKind } from '@/drizzle/schema'

export const groupKindOptions = [
  'COMMITTEE',
  'BOARD',
] as const satisfies readonly GroupKind[]

export const defaultGroupKind = 'COMMITTEE' satisfies GroupKind

export function formatGroupKind(kind: GroupKind) {
  switch (kind) {
    case 'COMMITTEE':
      return 'Committee'
    case 'BOARD':
      return 'Board'
  }
}

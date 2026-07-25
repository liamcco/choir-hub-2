import type { GroupKind } from '@/core/topology'

export const groupKindOptions = ['committee', 'board'] as const satisfies readonly GroupKind[]

export const defaultGroupKind = 'committee' satisfies GroupKind

export function formatGroupKind(kind: GroupKind): string {
  switch (kind) {
    case 'committee':
      return 'Committee'
    case 'board':
      return 'Board'
  }
}

import { describe, expect, test } from 'bun:test'
import type { Group } from '@/drizzle/schema'
import { formatPositionLabel, formatPositionScopeLabel } from './position'

describe('Position scope labels', () => {
  test('renders only the supplied Group scopes', () => {
    const groups: Group[] = [
      { id: 'board', name: 'Board', kind: 'board', scopeType: 'csk', scopeKey: 'csk', choirId: null },
      { id: 'party', name: 'Party Mastery', kind: 'committee', scopeType: 'csk', scopeKey: 'csk', choirId: null },
      { id: 'web', name: 'Web Mastery', kind: 'committee', scopeType: 'csk', scopeKey: 'csk', choirId: null },
    ]

    expect(formatPositionScopeLabel([groups[1]], groups)).toBe('Party Mastery')
  })

  test('omits the scope suffix when a Position has no scopes', () => {
    expect(formatPositionLabel('Treasurer', '')).toBe('Treasurer')
  })

  test('renders typed scopes in deterministic order', () => {
    expect(
      formatPositionScopeLabel(
        [
          { targetType: 'group', targetKey: 'party', groupId: 'party' },
          { targetType: 'csk', targetKey: 'csk' },
          { targetType: 'choir', targetKey: 'kk', choirId: 'kk' },
          { targetType: 'section', targetKey: 'kk-t1', sectionId: 'kk-t1' },
        ],
        {
          choirs: [{ id: 'kk', name: 'Kammarkören', shortName: 'KK' }],
          sections: [{ id: 'kk-t1', choirId: 'kk', name: 'T1', voiceType: 'T1' }],
          groups: [
            { id: 'party', name: 'Party Mastery', kind: 'committee', scopeType: 'csk', scopeKey: 'csk', choirId: null },
          ],
        },
      ),
    ).toBe('CSK · KK · KKT1 · Party Mastery')
  })

  test('renders every full choir Section name without a space', () => {
    expect(
      formatPositionScopeLabel(
        [
          { targetType: 'section', targetKey: 'dk-a1', sectionId: 'dk-a1' },
          { targetType: 'section', targetKey: 'kk-b', sectionId: 'kk-b' },
        ],
        {
          choirs: [
            { id: 'dk', name: 'Damkören', shortName: 'DK' },
            { id: 'kk', name: 'Kammarkören', shortName: 'KK' },
          ],
          sections: [
            { id: 'dk-a1', choirId: 'dk', name: 'A1', voiceType: 'A1' },
            { id: 'kk-b', choirId: 'kk', name: 'B', voiceType: 'B' },
          ],
          groups: [],
        },
      ),
    ).toBe('DKA1 · KKB')
  })
})

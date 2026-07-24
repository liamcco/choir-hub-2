import { describe, expect, test } from 'bun:test'
import { formatPositionScopeLabel } from './position'

describe('Position scope labels', () => {
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
          groups: [{ id: 'party', name: 'Party Mastery', kind: 'committee', scopeType: 'csk', scopeKey: 'csk', choirId: null }],
        },
      ),
    ).toBe('CSK · Kammarkören · KK T1 · Party Mastery')
  })
})

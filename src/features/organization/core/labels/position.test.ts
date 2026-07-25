import { describe, expect, test } from 'bun:test'
import { topology } from '@/core/topology'
import { formatPositionLabel, formatPositionScopeLabel } from './position'

describe('Position scope labels', () => {
  test('renders only the supplied Group scopes', () => {
    expect(
      formatPositionScopeLabel([{ type: 'group', groupId: 'party-mastery' }], {
        choirs: topology.choirs,
        sections: topology.sections,
        groups: topology.groups,
      }),
    ).toBe('Party Mastery')
  })

  test('omits the scope suffix when a Position has no scopes', () => {
    expect(formatPositionLabel('Treasurer', '')).toBe('Treasurer')
  })

  test('renders typed scopes in deterministic order', () => {
    expect(
      formatPositionScopeLabel(
        [
          { type: 'group', groupId: 'party-mastery' },
          { type: 'csk' },
          { type: 'choir', choirId: 'kk' },
          { type: 'section', sectionId: 'kk-t' },
        ],
        { choirs: topology.choirs, sections: topology.sections, groups: topology.groups },
      ),
    ).toBe('CSK · KK · KKT · Party Mastery')
  })

  test('renders every full choir Section name without a space', () => {
    expect(
      formatPositionScopeLabel(
        [
          { type: 'section', sectionId: 'dk-a1' },
          { type: 'section', sectionId: 'kk-b' },
        ],
        { choirs: topology.choirs, sections: topology.sections, groups: topology.groups },
      ),
    ).toBe('DKA1 · KKB')
  })
})

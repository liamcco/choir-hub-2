import { describe, expect, test } from 'bun:test'
import type { ReferenceCatalog } from './reference-catalog'
import {
  groupCatalog,
  positionCatalog,
  referenceCatalog,
  sectionCatalog,
  validateReferenceCatalog,
} from './reference-catalog'

describe('reference catalog', () => {
  test('contains the fixed choir and section topology', () => {
    expect(referenceCatalog.choirs.map(({ id }) => id)).toEqual(['mk', 'kk', 'dk'])
    expect(sectionCatalog.map(({ id }) => id)).toEqual([
      'mk-t1',
      'mk-t2',
      'mk-b1',
      'mk-b2',
      'kk-s1',
      'kk-s2',
      'kk-a1',
      'kk-a2',
      'kk-t1',
      'kk-t2',
      'kk-b1',
      'kk-b2',
      'dk-s1',
      'dk-s2',
      'dk-a1',
      'dk-a2',
    ])
  })

  test('validates the complete fixed catalog', () => {
    expect(validateReferenceCatalog()).toBe(referenceCatalog)
    expect(groupCatalog).toHaveLength(16)
    expect(positionCatalog).toHaveLength(31)
    expect(positionCatalog.find((position) => position.id === 'kk-s-voice-parent')?.scopes).toHaveLength(2)
  })

  test('rejects duplicate identifiers and invalid cross-references', () => {
    expect(() =>
      validateReferenceCatalog({
        ...referenceCatalog,
        choirs: [...referenceCatalog.choirs, referenceCatalog.choirs[0]],
      } as unknown as ReferenceCatalog),
    ).toThrow('Reference catalog identifier is duplicated')
    expect(() =>
      validateReferenceCatalog({
        ...referenceCatalog,
        groups: [
          ...referenceCatalog.groups,
          { id: 'invalid', kind: 'COMMITTEE', name: 'Invalid', scope: { type: 'choir', choirId: 'unknown' } },
        ],
      } as ReferenceCatalog),
    ).toThrow('unknown Choir')
    expect(() =>
      validateReferenceCatalog({
        ...referenceCatalog,
        sections: [
          ...referenceCatalog.sections,
          { id: 'invalid-section', choirId: 'mk', name: 'T', voiceType: 'T' as never },
        ],
      } as ReferenceCatalog),
    ).toThrow('invalid Voice Type')
  })
})

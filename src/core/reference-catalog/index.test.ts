import { describe, expect, test } from 'bun:test'
import type { ReferenceCatalog } from './index'
import { groupCatalog, positionCatalog, referenceCatalog, sectionCatalog, validateReferenceCatalog } from './index'

describe('reference catalog', () => {
  test('contains the fixed choir and section topology', () => {
    expect(referenceCatalog.choirs.map(({ id }) => id)).toEqual(['mk', 'kk', 'dk'])
    expect(sectionCatalog.map(({ id }) => id)).toEqual([
      'mk-t1',
      'mk-t2',
      'mk-b1',
      'mk-b2',
      'kk-s',
      'kk-a',
      'kk-t',
      'kk-b',
      'dk-s1',
      'dk-s2',
      'dk-a1',
      'dk-a2',
    ])
    expect(sectionCatalog.find(({ id }) => id === 'kk-b')).toMatchObject({
      name: 'B',
      voiceType: 'B',
      allowedVoiceTypes: ['B1', 'B2'],
    })
  })

  test('validates the complete fixed catalog', () => {
    expect(validateReferenceCatalog()).toBe(referenceCatalog)
    expect(groupCatalog).toHaveLength(17)
    expect(positionCatalog).toHaveLength(37)
    expect(
      positionCatalog.filter((position) => ['inspector', 'accountant-1', 'accountant-2'].includes(position.id)),
    ).toEqual(
      expect.arrayContaining([
        { id: 'inspector', name: 'Inspector', scopes: [{ type: 'csk' }] },
        { id: 'accountant-1', name: 'Accountant 1', scopes: [{ type: 'csk' }] },
        { id: 'accountant-2', name: 'Accountant 2', scopes: [{ type: 'csk' }] },
      ]),
    )
    expect(positionCatalog.find((position) => position.id === 'kk-s-voice-parent')?.scopes).toHaveLength(1)
    expect(positionCatalog.find((position) => position.id === 'kk-s-voice-parent')?.scopes[0]).toEqual({
      type: 'section',
      sectionId: 'kk-s',
    })
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
          { id: 'invalid', kind: 'committee', name: 'Invalid', scope: { type: 'choir', choirId: 'unknown' } },
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

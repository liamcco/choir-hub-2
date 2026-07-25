import { describe, expect, test } from 'bun:test'
import { topologyData } from './data'
import type { Topology } from './index'
import { getPosition, listGroups, listPositions, topology, validateTopology } from './index'

describe('topology', () => {
  test('contains the fixed choir and section topology', () => {
    expect(topology.choirs.map(({ id }) => id)).toEqual(['mk', 'kk', 'dk'])
    expect(topology.sections.map(({ id }) => id)).toEqual([
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
    expect(topology.sections.find(({ id }) => id === 'kk-b')).toMatchObject({
      name: 'B',
      allowedVoiceTypes: ['B1', 'B2'],
    })
  })

  test('defaults omitted lifecycle status to active', () => {
    expect(topologyData.choirs.every((choir) => !('status' in choir))).toBe(true)
    expect(topology.choirs.every(({ status }) => status === 'active')).toBe(true)
    expect(topology.sections.every(({ status }) => status === 'active')).toBe(true)
    expect(topology.groups.every(({ status }) => status === 'active')).toBe(true)
    expect(topology.positions.every(({ status }) => status === 'active')).toBe(true)
  })

  test('validates and exposes the complete fixed topology', () => {
    expect(validateTopology()).toBe(topology)
    expect(listGroups()).toHaveLength(17)
    expect(listPositions()).toHaveLength(37)
    expect(
      listPositions().filter((position) => ['inspector', 'accountant-1', 'accountant-2'].includes(position.id)),
    ).toEqual(
      expect.arrayContaining([
        { id: 'inspector', name: 'Inspector', scopes: [{ type: 'csk' }], status: 'active' },
        { id: 'accountant-1', name: 'Accountant 1', scopes: [{ type: 'csk' }], status: 'active' },
        { id: 'accountant-2', name: 'Accountant 2', scopes: [{ type: 'csk' }], status: 'active' },
      ]),
    )
    expect(getPosition('vice-president')).toEqual({
      id: 'vice-president',
      name: 'Vice President',
      scopes: [
        { type: 'group', groupId: 'board' },
        { type: 'group', groupId: 'recruitment-committee' },
      ],
      status: 'active',
    })
    expect(getPosition('kk-s-voice-parent')?.scopes).toEqual([{ type: 'section', sectionId: 'kk-s' }])
  })

  test('rejects duplicate identifiers and invalid cross-references', () => {
    expect(() =>
      validateTopology({
        ...topology,
        choirs: [...topology.choirs, topology.choirs[0]],
      }),
    ).toThrow('Topology identifier is duplicated')
    expect(() =>
      validateTopology({
        ...topology,
        groups: [
          ...topology.groups,
          {
            id: 'invalid' as never,
            kind: 'committee',
            name: 'Invalid',
            scope: { type: 'choir', choirId: 'unknown' as never },
            status: 'active',
          },
        ],
      } as Topology),
    ).toThrow('unknown Choir')
    expect(() =>
      validateTopology({
        ...topology,
        sections: [
          ...topology.sections,
          {
            id: 'invalid-section' as never,
            choirId: 'mk',
            name: 'T',
            allowedVoiceTypes: ['X' as never],
            status: 'active',
          },
        ],
      } as Topology),
    ).toThrow('invalid Voice Type')
  })
})

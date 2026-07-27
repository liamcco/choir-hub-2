import { describe, expect, test } from 'bun:test'
import type { Position } from '@/core/topology'
import {
  evaluatePositionAssignmentEligibility,
  type PositionAssignmentEligibilityFacts,
} from './position-assignment-eligibility'

const startsAt = new Date('2026-01-01T00:00:00Z')

describe('Position Assignment Eligibility', () => {
  test('allows Active and Passive by default but rejects Former', () => {
    const position = createPosition()

    expect(evaluate(position, { memberStatus: 'ACTIVE' }).eligible).toBe(true)
    expect(evaluate(position, { memberStatus: 'PASSIVE' }).eligible).toBe(true)
    expect(evaluate(position, { memberStatus: 'FORMER' })).toMatchObject({
      eligible: false,
      failures: [{ type: 'memberStatus' }],
    })
  })

  test('supports the two explicit Member Status requirements', () => {
    const activeOnly = createPosition({
      eligibility: { mode: 'all', requirements: [{ type: 'memberStatus', value: 'activeOnly' }] },
    })
    const formerAllowed = createPosition({
      eligibility: { mode: 'all', requirements: [{ type: 'memberStatus', value: 'formerAllowed' }] },
    })

    expect(evaluate(activeOnly, { memberStatus: 'PASSIVE' }).eligible).toBe(false)
    expect(evaluate(activeOnly, { memberStatus: 'ACTIVE' }).eligible).toBe(true)
    expect(evaluate(formerAllowed, { memberStatus: 'FORMER' }).eligible).toBe(true)
  })

  test('matches any listed Voice Capability with base and fine Voice semantics', () => {
    const baseVoice = createPosition({
      eligibility: { mode: 'all', requirements: [{ type: 'voiceCapability', voices: ['B'] }] },
    })
    const fineVoice = createPosition({
      eligibility: { mode: 'all', requirements: [{ type: 'voiceCapability', voices: ['B1', 'A2'] }] },
    })

    expect(evaluate(baseVoice, { voiceCapabilities: ['B2'] }).eligible).toBe(true)
    expect(evaluate(fineVoice, { voiceCapabilities: ['B2'] }).eligible).toBe(false)
    expect(evaluate(fineVoice, { voiceCapabilities: ['A2'] }).eligible).toBe(true)
  })

  test('combines explicit requirements using the Position mode', () => {
    const all = createPosition({
      eligibility: {
        mode: 'all',
        requirements: [
          { type: 'memberStatus', value: 'activeOnly' },
          { type: 'voiceCapability', voices: ['B'] },
        ],
      },
    })
    const any = createPosition({
      eligibility: {
        mode: 'any',
        requirements: [
          { type: 'voiceCapability', voices: ['B'] },
          { type: 'voiceCapability', voices: ['A'] },
        ],
      },
    })

    expect(evaluate(all, { memberStatus: 'ACTIVE', voiceCapabilities: ['B1'] }).eligible).toBe(true)
    expect(evaluate(all, { memberStatus: 'ACTIVE', voiceCapabilities: ['A1'] }).eligible).toBe(false)
    expect(evaluate(any, { voiceCapabilities: ['A1'] }).eligible).toBe(true)
    expect(evaluate(any, { voiceCapabilities: ['T1'] }).eligible).toBe(false)
  })

  test('keeps scope-derived requirements mandatory outside explicit any mode', () => {
    const position = createPosition({
      scopes: [{ type: 'choir', choirId: 'mk' }],
      eligibility: {
        mode: 'any',
        requirements: [{ type: 'voiceCapability', voices: ['A'] }],
      },
    })

    const result = evaluate(position, { voiceCapabilities: ['A1'] })
    expect(result).toMatchObject({
      eligible: false,
      failures: [{ type: 'choirMembership' }],
    })

    expect(
      evaluate(createPosition({ scopes: [{ type: 'section', sectionId: 'mk-b1' }] }), { voiceCapabilities: ['A1'] })
        .failures[0],
    ).toMatchObject({ type: 'sectionPlacement' })
  })

  test('checks relationships at Assignment start rather than across the whole period', () => {
    const position = createPosition({ scopes: [{ type: 'choir', choirId: 'mk' }] })
    const result = evaluate(position, {
      choirMemberships: [{ choirId: 'mk', startsAt: new Date('2025-01-01'), endsAt: new Date('2026-02-01') }],
    })

    expect(result.eligible).toBe(true)
  })
})

function evaluate(position: Position, overrides: Partial<PositionAssignmentEligibilityFacts> = {}) {
  return evaluatePositionAssignmentEligibility({
    position,
    startsAt,
    facts: {
      memberStatus: 'ACTIVE',
      choirMemberships: [],
      sectionPlacements: [],
      voiceCapabilities: [],
      ...overrides,
    },
  })
}

function createPosition(overrides: Partial<Position> = {}): Position {
  return {
    id: 'inspector',
    name: 'Test Position',
    scopes: [],
    status: 'active',
    ...overrides,
  }
}

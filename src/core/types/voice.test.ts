import { describe, expect, test } from 'bun:test'
import {
  BASE_VOICES,
  baseVoice,
  FINE_VOICES,
  fineVoices,
  hasVoiceOverlap,
  isBaseVoice,
  isFineVoice,
  voiceCatalog,
  voiceMatch,
  voiceOrder,
} from './voice'

describe('voice catalog', () => {
  test('defines the canonical base, fine, and mixed ordering', () => {
    expect(BASE_VOICES).toEqual(['S', 'A', 'T', 'B'])
    expect(FINE_VOICES).toEqual(['S1', 'S2', 'A1', 'A2', 'T1', 'T2', 'B1', 'B2'])
    expect(voiceCatalog.map(({ voice }) => voice)).toEqual([
      'S',
      'S1',
      'S2',
      'A',
      'A1',
      'A2',
      'T',
      'T1',
      'T2',
      'B',
      'B1',
      'B2',
    ])
  })

  test('normalizes base and fine voices', () => {
    expect(baseVoice('S')).toBe('S')
    expect(baseVoice('S1')).toBe('S')
    expect(fineVoices('S')).toEqual(['S1', 'S2'])
    expect(fineVoices('S1')).toEqual(['S1'])
  })

  test('matches fine input against broad and fine criteria', () => {
    expect(voiceMatch({ input: 'S1', criterion: 'S' })).toBe(true)
    expect(voiceMatch({ input: 'S1', criterion: 'S1' })).toBe(true)
    expect(voiceMatch({ input: 'S', criterion: 'S1' })).toBe(false)
    expect(voiceMatch({ input: 'A1', criterion: 'S' })).toBe(false)
  })

  test('detects parent-child overlap but permits mixed granularity', () => {
    expect(hasVoiceOverlap(['S', 'A', 'T1', 'T2'])).toBe(false)
    expect(hasVoiceOverlap(['S', 'S1'])).toBe(true)
    expect(hasVoiceOverlap(['S1', 'S2'])).toBe(false)
  })

  test('provides runtime guards and canonical order', () => {
    expect(isBaseVoice('S')).toBe(true)
    expect(isBaseVoice('S1')).toBe(false)
    expect(isFineVoice('S1')).toBe(true)
    expect(isFineVoice('S3')).toBe(false)
    expect(voiceOrder('S')).toBeLessThan(voiceOrder('S1'))
    expect(voiceOrder('S2')).toBeLessThan(voiceOrder('A'))
  })
})

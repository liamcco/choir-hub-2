/**
 * CSK's organization-wide musical voice vocabulary.
 *
 * Base voices describe an undivided musical family. Fine voices describe
 * numbered singer designations and divided musical parts.
 */
export const BASE_VOICES = ['S', 'A', 'T', 'B'] as const
export type BaseVoice = (typeof BASE_VOICES)[number]

export const FINE_VOICES = ['S1', 'S2', 'A1', 'A2', 'T1', 'T2', 'B1', 'B2'] as const
export type FineVoice = (typeof FINE_VOICES)[number]

export type Voice = BaseVoice | FineVoice

type VoiceCatalogEntry = {
  readonly voice: Voice
  readonly kind: 'base' | 'fine'
  readonly parent: BaseVoice | null
  readonly children: readonly FineVoice[]
}

export const voiceCatalog: readonly VoiceCatalogEntry[] = [
  { voice: 'S', kind: 'base', parent: null, children: ['S1', 'S2'] },
  { voice: 'S1', kind: 'fine', parent: 'S', children: [] },
  { voice: 'S2', kind: 'fine', parent: 'S', children: [] },
  { voice: 'A', kind: 'base', parent: null, children: ['A1', 'A2'] },
  { voice: 'A1', kind: 'fine', parent: 'A', children: [] },
  { voice: 'A2', kind: 'fine', parent: 'A', children: [] },
  { voice: 'T', kind: 'base', parent: null, children: ['T1', 'T2'] },
  { voice: 'T1', kind: 'fine', parent: 'T', children: [] },
  { voice: 'T2', kind: 'fine', parent: 'T', children: [] },
  { voice: 'B', kind: 'base', parent: null, children: ['B1', 'B2'] },
  { voice: 'B1', kind: 'fine', parent: 'B', children: [] },
  { voice: 'B2', kind: 'fine', parent: 'B', children: [] },
] as const

const baseByFineVoice: Readonly<Record<FineVoice, BaseVoice>> = {
  S1: 'S',
  S2: 'S',
  A1: 'A',
  A2: 'A',
  T1: 'T',
  T2: 'T',
  B1: 'B',
  B2: 'B',
}

const fineByBaseVoice: Readonly<Record<BaseVoice, readonly [FineVoice, FineVoice]>> = {
  S: ['S1', 'S2'],
  A: ['A1', 'A2'],
  T: ['T1', 'T2'],
  B: ['B1', 'B2'],
}

const baseVoiceSet = new Set<BaseVoice>(BASE_VOICES)

export function isBaseVoice(value: string): value is BaseVoice {
  return baseVoiceSet.has(value as BaseVoice)
}

export function isFineVoice(value: string): value is FineVoice {
  return !isBaseVoice(value) && /^(S|A|T|B)[12]$/.test(value)
}

export function baseVoice(voice: Voice): BaseVoice {
  return isBaseVoice(voice) ? voice : baseByFineVoice[voice]
}

export function fineVoices(voice: Voice): readonly FineVoice[] {
  return isBaseVoice(voice) ? fineByBaseVoice[voice] : [voice]
}

export function voiceMatch(input: { readonly input: Voice; readonly criterion: Voice }): boolean {
  const { input: actual, criterion } = input
  return isBaseVoice(criterion) ? baseVoice(actual) === criterion : actual === criterion
}

/** Returns true when a voice set contains both a base voice and its children. */
export function hasVoiceOverlap(voices: readonly Voice[]): boolean {
  const selected = new Set(voices)
  return BASE_VOICES.some((voice) => selected.has(voice) && fineVoices(voice).some((fine) => selected.has(fine)))
}

export function voiceOrder(voice: Voice): number {
  return voiceCatalog.findIndex((entry) => entry.voice === voice)
}

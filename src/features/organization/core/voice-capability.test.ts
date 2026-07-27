import { beforeEach, describe, expect, mock, test } from 'bun:test'

const selectResults: unknown[][] = []
const select = mock(() => ({
  from: mock(() => ({
    where: mock(() => ({
      limit: mock(async () => selectResults.shift() ?? []),
      orderBy: mock(async () => selectResults.shift() ?? []),
    })),
  })),
}))
const insertReturning = mock(async () => selectResults.shift() ?? [])
const insert = mock(() => ({ values: mock(() => ({ returning: insertReturning })) }))
const deleteReturning = mock(async () => selectResults.shift() ?? [])
const deleteQuery = mock(() => ({ where: mock(() => ({ returning: deleteReturning })) }))

mock.module('@/core/db', () => ({ db: { select, insert, delete: deleteQuery } }))
mock.module('server-only', () => ({}))

const { ensureVoiceCapability, voiceCapability } = await import('./voice-capability')

beforeEach(() => {
  selectResults.length = 0
  select.mockClear()
  insert.mockClear()
  insertReturning.mockClear()
  deleteQuery.mockClear()
  deleteReturning.mockClear()
})

describe('Voice Capability persistence', () => {
  test('adds a fine-grained capability for an existing User', async () => {
    selectResults.push([{ id: 'user-1' }], [], [{ id: 'capability-1', userId: 'user-1', voice: 'B1' }])

    await expect(voiceCapability.add({ userId: 'user-1', voice: 'B1' })).resolves.toEqual({
      id: 'capability-1',
      userId: 'user-1',
      voice: 'B1',
    })
    expect(insert).toHaveBeenCalledTimes(1)
  })

  test('rejects duplicate capabilities and base Voices', async () => {
    selectResults.push([{ id: 'user-1' }], [{ id: 'capability-1' }])
    await expect(voiceCapability.add({ userId: 'user-1', voice: 'B1' })).rejects.toThrow(
      'This User already has this Voice Capability.',
    )

    selectResults.push([{ id: 'user-1' }])
    await expect(voiceCapability.add({ userId: 'user-1', voice: 'B' as never })).rejects.toThrow(
      'Voice Capability must use a fine Voice.',
    )
  })

  test('removes an existing capability', async () => {
    selectResults.push([{ id: 'capability-1' }], [{ id: 'capability-1', userId: 'user-1', voice: 'B1' }])

    await expect(voiceCapability.remove('capability-1')).resolves.toEqual({
      id: 'capability-1',
      userId: 'user-1',
      voice: 'B1',
    })
    expect(deleteQuery).toHaveBeenCalledTimes(1)
  })

  test('lists capabilities by an inclusive base Voice or exact fine Voice', async () => {
    const capabilities = [{ id: 'capability-1', userId: 'user-1', voice: 'B1' as const }]
    selectResults.push(capabilities)
    await expect(voiceCapability.list({ voice: 'B' })).resolves.toEqual(capabilities)

    selectResults.push(capabilities)
    await expect(voiceCapability.list({ voice: 'B1' })).resolves.toEqual(capabilities)
  })

  test('ensures a capability idempotently for Section Placement writes', async () => {
    const database = { select, insert } as never
    const existing = { id: 'capability-1', userId: 'user-1', voice: 'B1' as const }
    selectResults.push([{ id: 'user-1' }], [existing])
    await expect(ensureVoiceCapability(database, { userId: 'user-1', voice: 'B1' })).resolves.toEqual(existing)
    expect(insert).not.toHaveBeenCalled()

    selectResults.push([{ id: 'user-1' }], [], [existing])
    await expect(ensureVoiceCapability(database, { userId: 'user-1', voice: 'B1' })).resolves.toEqual(existing)
    expect(insert).toHaveBeenCalledTimes(1)
  })
})

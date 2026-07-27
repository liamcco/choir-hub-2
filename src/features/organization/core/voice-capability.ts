import 'server-only'

import { and, asc, eq, inArray } from 'drizzle-orm'
import { db } from '@/core/db'
import { type FineVoice, fineVoices, isFineVoice, type Voice } from '@/core/types'
import { user, voiceCapability as voiceCapabilityTable } from '@/drizzle/schema'
import { DuplicateEntityError, EntityDoesNotExistError, InvalidRelationshipError } from './errors'

export type VoiceCapabilityDatabase = Pick<typeof db, 'select' | 'insert'>

export const voiceCapability = {
  list(input: { userId?: string; voice?: Voice } = {}) {
    const matchingVoices = input.voice ? fineVoices(input.voice) : undefined
    return db
      .select()
      .from(voiceCapabilityTable)
      .where(
        and(
          input.userId ? eq(voiceCapabilityTable.userId, input.userId) : undefined,
          matchingVoices ? inArray(voiceCapabilityTable.voice, matchingVoices) : undefined,
        ),
      )
      .orderBy(asc(voiceCapabilityTable.userId), asc(voiceCapabilityTable.voice))
  },

  async add(input: { userId: string; voice: FineVoice }) {
    assertFineVoice(input.voice)
    await assertUserExists(db, input.userId)
    const existing = await findVoiceCapability(db, input)
    if (existing) throw new DuplicateEntityError('This User already has this Voice Capability.', { field: 'voice' })
    return insertVoiceCapability(db, input)
  },

  async remove(id: string) {
    const [current] = await db.select().from(voiceCapabilityTable).where(eq(voiceCapabilityTable.id, id)).limit(1)
    if (!current) throw new EntityDoesNotExistError('Choose an existing Voice Capability.')
    return db
      .delete(voiceCapabilityTable)
      .where(eq(voiceCapabilityTable.id, id))
      .returning()
      .then((rows) => rows[0])
  },
}

export async function ensureVoiceCapability(
  database: VoiceCapabilityDatabase,
  input: { userId: string; voice: FineVoice },
) {
  assertFineVoice(input.voice)
  await assertUserExists(database, input.userId)
  const existing = await findVoiceCapability(database, input)
  return existing ?? insertVoiceCapability(database, input)
}

async function findVoiceCapability(database: VoiceCapabilityDatabase, input: { userId: string; voice: FineVoice }) {
  const [existing] = await database
    .select()
    .from(voiceCapabilityTable)
    .where(and(eq(voiceCapabilityTable.userId, input.userId), eq(voiceCapabilityTable.voice, input.voice)))
    .limit(1)
  return existing
}

function insertVoiceCapability(database: VoiceCapabilityDatabase, input: { userId: string; voice: FineVoice }) {
  return database
    .insert(voiceCapabilityTable)
    .values(input)
    .returning()
    .then((rows) => rows[0])
}

function assertFineVoice(voice: string): asserts voice is FineVoice {
  if (!isFineVoice(voice))
    throw new InvalidRelationshipError('Voice Capability must use a fine Voice.', { field: 'voice' })
}

async function assertUserExists(database: VoiceCapabilityDatabase, userId: string) {
  if (!(await database.select({ id: user.id }).from(user).where(eq(user.id, userId)).limit(1)).length)
    throw new EntityDoesNotExistError('Choose an existing User.', { field: 'userId' })
}

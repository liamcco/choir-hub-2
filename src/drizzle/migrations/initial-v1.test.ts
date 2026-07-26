import { describe, expect, test } from 'bun:test'

const migration = await Bun.file(new URL('./0000_topology-in-code.sql', import.meta.url)).text()

describe('topology-in-code migration PostgreSQL guarantees', () => {
  test('prevents temporal overlap for every dated relationship', () => {
    for (const constraint of [
      'ChoirMembership_user_period_excl',
      'SectionPlacement_user_period_excl',
      'GroupMembership_user_group_period_excl',
      'PositionAssignment_position_period_excl',
    ]) {
      expect(migration).toContain(`"${constraint}" EXCLUDE USING gist`)
    }
  })

  test('uses immutable ranges for timestamp columns', () => {
    expect(migration).toContain('tsrange("startsAt", "endsAt", \'[)\')')
    expect(migration).not.toContain('tstzrange')
    expect(migration).not.toContain('COALESCE("endsAt", \'infinity\'::timestamp)')
  })

  test('enforces current uniqueness and keeps topology out of the database', () => {
    expect(migration).toContain('ChoirMembership_one_current_per_user_idx')
    expect(migration).toContain('SectionPlacement_one_current_per_user_idx')
    expect(migration).toContain('PositionAssignment_one_current_per_position_idx')
    for (const table of ['Choir', 'Section', 'Group', 'Position', 'PositionScope']) {
      expect(migration).not.toContain(`CREATE TABLE "${table}"`)
    }
    expect(migration).not.toContain('REFERENCES "public"."Choir"')
    expect(migration).not.toContain('REFERENCES "public"."Group"')
    expect(migration).not.toContain('REFERENCES "public"."Position"')
    expect(migration).not.toContain('REFERENCES "public"."Section"')
  })

  test('stores placements with the shared Voice enum while restricting them to fine voices', () => {
    expect(migration).toContain('CREATE TYPE "public"."Voice" AS ENUM')
    expect(migration).toContain('"voice" "Voice" NOT NULL')
    expect(migration).toContain('SectionPlacement_fine_voice_check')
    expect(migration).not.toContain('VoiceType')
    expect(migration).not.toContain('voiceType')
  })
})

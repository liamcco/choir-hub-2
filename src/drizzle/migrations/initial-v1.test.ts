import { describe, expect, test } from 'bun:test'

const migration = await Bun.file(new URL('./0000_initial_v1.sql', import.meta.url)).text()

describe('initial V1 migration PostgreSQL guarantees', () => {
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

  test('enforces current uniqueness and cross-table target shape', () => {
    expect(migration).toContain('ChoirMembership_one_current_per_user_idx')
    expect(migration).toContain('SectionPlacement_one_current_per_user_idx')
    expect(migration).toContain('PositionAssignment_one_current_per_position_idx')
    expect(migration).toContain('GroupMembership_committee_only')
    expect(migration).toContain('SectionPlacement_choir_coverage')
  })
})

import { describe, expect, test } from 'bun:test'
import { TransferPlacementFormSchema } from './schemas'

describe('Placement form schemas', () => {
  test('allows a choir transfer without a section or voice', () => {
    expect(
      TransferPlacementFormSchema.safeParse({
        userId: 'user-1',
        choirId: 'kk',
        sectionId: 'none',
      }).success,
    ).toBe(true)
  })
})

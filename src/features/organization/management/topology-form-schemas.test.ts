import { describe, expect, test } from 'bun:test'
import type { ChoirId, GroupId, PositionId, SectionId } from '@/core/topology'
import type { FineVoice } from '@/core/types'
import { CreateGroupMembershipFormSchema } from './group-memberships/schemas'
import { TransferPlacementFormSchema } from './placement/schemas'
import { CreatePositionAssignmentFormSchema } from './position-assignments/schemas'

describe('topology-backed management form schemas', () => {
  test('parses known topology IDs into their domain types', () => {
    const transfer = TransferPlacementFormSchema.parse({
      userId: 'user-1',
      choirId: 'kk',
      sectionId: 'kk-s',
      voice: 'S1',
    })
    const membership = CreateGroupMembershipFormSchema.parse({
      userId: 'user-1',
      groupId: 'concert-mastery',
    })
    const assignment = CreatePositionAssignmentFormSchema.parse({
      userId: 'user-1',
      positionId: 'president',
    })

    const choirId: ChoirId = transfer.choirId
    const sectionId: SectionId | undefined = transfer.sectionId
    const voice: FineVoice | undefined = transfer.voice
    const groupId: GroupId = membership.groupId
    const positionId: PositionId = assignment.positionId

    expect({ choirId, sectionId, voice, groupId, positionId }).toEqual({
      choirId: 'kk',
      sectionId: 'kk-s',
      voice: 'S1',
      groupId: 'concert-mastery',
      positionId: 'president',
    })
  })

  test('normalizes empty optional placement choices', () => {
    expect(
      TransferPlacementFormSchema.parse({
        userId: 'user-1',
        choirId: 'kk',
        sectionId: 'none',
        voice: '',
      }),
    ).toEqual({ userId: 'user-1', choirId: 'kk', sectionId: undefined, voice: undefined })
  })

  test('rejects blank required choices and unknown topology IDs', () => {
    expect(TransferPlacementFormSchema.safeParse({ userId: 'user-1', choirId: '', sectionId: 'none' }).success).toBe(
      false,
    )
    expect(
      TransferPlacementFormSchema.safeParse({ userId: 'user-1', choirId: 'kk', sectionId: 'unknown' }).success,
    ).toBe(false)
    expect(CreateGroupMembershipFormSchema.safeParse({ userId: 'user-1', groupId: 'unknown' }).success).toBe(false)
    expect(CreateGroupMembershipFormSchema.safeParse({ userId: 'user-1', groupId: '' }).success).toBe(false)
    expect(CreatePositionAssignmentFormSchema.safeParse({ userId: 'user-1', positionId: 'unknown' }).success).toBe(
      false,
    )
    expect(CreatePositionAssignmentFormSchema.safeParse({ userId: 'user-1', positionId: '' }).success).toBe(false)
  })
})

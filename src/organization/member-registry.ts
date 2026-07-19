import type {
  CreateMemberInput,
  OrganizationPersistence,
  OrganizationRecord,
  UpdateMemberInput,
} from '@/organization/types'
import { MemberStatus } from '@/prisma/generated/client'

export type MemberRegistry = {
  listMembers(): Promise<OrganizationRecord<'member'>[]>
  createMember(input: CreateMemberInput): Promise<OrganizationRecord<'member'>>
  updateMember(id: string, input: UpdateMemberInput): Promise<OrganizationRecord<'member'>>
}

export function createMemberRegistry(persistence: OrganizationPersistence): MemberRegistry {
  return {
    listMembers: () => persistence.listMembers(),
    createMember: (input) =>
      persistence.createMember({
        userId: input.userId,
        status: input.status ?? MemberStatus.ACTIVE,
      }),
    updateMember: (id, input) => persistence.updateMember(id, input),
  }
}

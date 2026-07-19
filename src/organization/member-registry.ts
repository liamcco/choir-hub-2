import type { CreateMemberInput, OrganizationRecord, UpdateMemberInput } from '@/organization/types'

export type MemberRegistry = {
  listMembers(): Promise<OrganizationRecord<'member'>[]>
  createMember(input: CreateMemberInput): Promise<OrganizationRecord<'member'>>
  updateMember(id: string, input: UpdateMemberInput): Promise<OrganizationRecord<'member'>>
}

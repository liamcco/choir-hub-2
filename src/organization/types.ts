import type {
  Group,
  GroupKind,
  GroupMembership,
  Member,
  MemberStatus,
  Position,
  PositionAssignment,
  PositionScope,
} from '@/prisma/generated/client'

export type OrganizationRecordMap = {
  group: Group
  member: Member
  groupMembership: GroupMembership
  position: Position
  positionScope: PositionScope
  positionAssignment: PositionAssignment
}

export type OrganizationRecord<Key extends keyof OrganizationRecordMap> = OrganizationRecordMap[Key]

export type CreateGroupInput = {
  kind: GroupKind
  name: string
  description?: string | null
  parentGroupId?: string | null
}

export type UpdateGroupInput = Partial<Pick<CreateGroupInput, 'kind' | 'name' | 'description' | 'parentGroupId'>>

export type CreateMemberInput = {
  userId: string
  status?: MemberStatus
}

export type UpdateMemberInput = Partial<Pick<CreateMemberInput, 'status'>>

export type CreateGroupMembershipInput = {
  memberId: string
  groupId: string
  startsAt: Date
  endsAt?: Date | null
}

export type UpdateGroupMembershipInput = Partial<
  Pick<CreateGroupMembershipInput, 'memberId' | 'groupId' | 'startsAt' | 'endsAt'>
>

export type CreatePositionInput = {
  name: string
  description?: string | null
}

export type UpdatePositionInput = Partial<Pick<CreatePositionInput, 'name' | 'description'>>

export type CreatePositionScopeInput = {
  positionId: string
  groupId: string
}

export type DeletePositionScopeInput = CreatePositionScopeInput

export type ListGroupMembershipsInput = {
  memberId?: string
  groupId?: string
  at?: Date
}

export type CreatePositionAssignmentInput = {
  positionId: string
  memberId: string
  startsAt: Date
  endsAt?: Date | null
}

export type ListPositionAssignmentsInput = {
  positionId?: string
  memberId?: string
  at?: Date
}

export type UpdatePositionAssignmentInput = Partial<
  Pick<CreatePositionAssignmentInput, 'positionId' | 'memberId' | 'startsAt' | 'endsAt'>
>

export type OrganizationPersistence = {
  listGroups(): Promise<Group[]>
  createGroup(input: Required<CreateGroupInput>): Promise<Group>
  updateGroup(id: string, input: UpdateGroupInput): Promise<Group>
  listMembers(): Promise<Member[]>
  createMember(input: Required<CreateMemberInput>): Promise<Member>
  updateMember(id: string, input: UpdateMemberInput): Promise<Member>
  listGroupMemberships(input?: ListGroupMembershipsInput): Promise<GroupMembership[]>
  createGroupMembership(input: Required<CreateGroupMembershipInput>): Promise<GroupMembership>
  updateGroupMembership(id: string, input: UpdateGroupMembershipInput): Promise<GroupMembership>
  listPositions(): Promise<Position[]>
  createPosition(input: Required<CreatePositionInput>): Promise<Position>
  updatePosition(id: string, input: UpdatePositionInput): Promise<Position>
  listPositionScopes(): Promise<PositionScope[]>
  createPositionScope(input: CreatePositionScopeInput): Promise<PositionScope>
  deletePositionScope(input: DeletePositionScopeInput): Promise<void>
  listPositionAssignments(input?: ListPositionAssignmentsInput): Promise<PositionAssignment[]>
  createPositionAssignment(input: Required<CreatePositionAssignmentInput>): Promise<PositionAssignment>
  updatePositionAssignment(id: string, input: UpdatePositionAssignmentInput): Promise<PositionAssignment>
}

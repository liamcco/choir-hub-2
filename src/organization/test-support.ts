import type { OrganizationPersistence, OrganizationRecord } from '@/organization'
import { isCurrentDatedPeriod } from '@/organization/dated-history'
import type { GroupKind, MemberStatus } from '@/prisma/generated/client'

export class InMemoryOrganizationPersistence implements OrganizationPersistence {
  private groups: OrganizationRecord<'group'>[] = []
  private members: OrganizationRecord<'member'>[] = []
  private groupMemberships: OrganizationRecord<'groupMembership'>[] = []
  private positions: OrganizationRecord<'position'>[] = []
  private positionScopes: OrganizationRecord<'positionScope'>[] = []
  private positionAssignments: OrganizationRecord<'positionAssignment'>[] = []
  private nextId = 1

  async listGroups() {
    return [...this.groups]
  }

  async createGroup(input: {
    kind: GroupKind
    name: string
    description: string | null
    parentGroupId: string | null
  }) {
    const now = new Date()
    const group = { id: this.id(), createdAt: now, updatedAt: now, ...input }
    this.groups.push(group)
    return group
  }

  async updateGroup(
    id: string,
    input: Partial<Pick<OrganizationRecord<'group'>, 'kind' | 'name' | 'description' | 'parentGroupId'>>,
  ) {
    const group = this.groups.find((candidate) => candidate.id === id)
    if (!group) {
      throw new Error(`Missing group ${id}`)
    }
    Object.assign(group, input, { updatedAt: new Date() })
    return group
  }

  async listMembers() {
    return [...this.members]
  }

  async createMember(input: { userId: string; status: MemberStatus }) {
    const now = new Date()
    const member = { id: this.id(), createdAt: now, updatedAt: now, ...input }
    this.members.push(member)
    return member
  }

  async updateMember(id: string, input: Partial<Pick<OrganizationRecord<'member'>, 'status'>>) {
    const member = this.members.find((candidate) => candidate.id === id)
    if (!member) {
      throw new Error(`Missing member ${id}`)
    }
    Object.assign(member, input, { updatedAt: new Date() })
    return member
  }

  async listGroupMemberships(input?: { memberId?: string; groupId?: string; at?: Date }) {
    return this.groupMemberships.filter(
      (membership) =>
        (!input?.memberId || membership.memberId === input.memberId) &&
        (!input?.groupId || membership.groupId === input.groupId) &&
        (!input?.at || isCurrentDatedPeriod(membership, input.at)),
    )
  }

  async createGroupMembership(input: { memberId: string; groupId: string; startsAt: Date; endsAt: Date | null }) {
    const membership = { id: this.id(), ...input }
    this.groupMemberships.push(membership)
    return membership
  }

  async updateGroupMembership(
    id: string,
    input: Partial<Pick<OrganizationRecord<'groupMembership'>, 'memberId' | 'groupId' | 'startsAt' | 'endsAt'>>,
  ) {
    const membership = this.groupMemberships.find((candidate) => candidate.id === id)
    if (!membership) {
      throw new Error(`Missing group membership ${id}`)
    }
    Object.assign(membership, input)
    return membership
  }

  async listPositions() {
    return [...this.positions]
  }

  async createPosition(input: { name: string; description: string | null }) {
    const now = new Date()
    const position = { id: this.id(), createdAt: now, updatedAt: now, ...input }
    this.positions.push(position)
    return position
  }

  async updatePosition(id: string, input: Partial<Pick<OrganizationRecord<'position'>, 'name' | 'description'>>) {
    const position = this.positions.find((candidate) => candidate.id === id)
    if (!position) {
      throw new Error(`Missing position ${id}`)
    }
    Object.assign(position, input, { updatedAt: new Date() })
    return position
  }

  async listPositionScopes() {
    return [...this.positionScopes]
  }

  async createPositionScope(input: { positionId: string; groupId: string }) {
    const scope = { createdAt: new Date(), ...input }
    this.positionScopes.push(scope)
    return scope
  }

  async deletePositionScope(input: { positionId: string; groupId: string }) {
    this.positionScopes = this.positionScopes.filter(
      (scope) => scope.positionId !== input.positionId || scope.groupId !== input.groupId,
    )
  }

  async listPositionAssignments(input?: { positionId?: string; memberId?: string; at?: Date }) {
    return this.positionAssignments.filter(
      (assignment) =>
        (!input?.positionId || assignment.positionId === input.positionId) &&
        (!input?.memberId || assignment.memberId === input.memberId) &&
        (!input?.at || isCurrentDatedPeriod(assignment, input.at)),
    )
  }

  async createPositionAssignment(input: { positionId: string; memberId: string; startsAt: Date; endsAt: Date | null }) {
    const assignment = { id: this.id(), createdAt: new Date(), ...input }
    this.positionAssignments.push(assignment)
    return assignment
  }

  async updatePositionAssignment(
    id: string,
    input: Partial<Pick<OrganizationRecord<'positionAssignment'>, 'positionId' | 'memberId' | 'startsAt' | 'endsAt'>>,
  ) {
    const assignment = this.positionAssignments.find((candidate) => candidate.id === id)
    if (!assignment) {
      throw new Error(`Missing position assignment ${id}`)
    }
    Object.assign(assignment, input)
    return assignment
  }

  private id() {
    return `record-${this.nextId++}`
  }
}

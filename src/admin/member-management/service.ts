import {
  type AccountAccessState,
  type AuthAdminGateway,
  type AuthUserAccount,
  type CreateLinkedMemberInput,
  type CreateManagedMemberInput,
  createMemberAccountLifecycle,
  type LinkedManagedMemberAccount,
  type ManagedMemberAccount,
  type UpdateAccountAccessInput,
  type UpdateMemberStatusInput,
} from '@/admin/member-management/account-lifecycle'
import type { AccessActor } from '@/lib/access-actor'
import { canManageMembers } from '@/lib/route-access'
import type { MemberRegistry, OrganizationRecord } from '@/organization'

export type MemberManagementActor = AccessActor

export type MemberManagementService = {
  listManagedMembers(actor: MemberManagementActor): Promise<ManagedMemberAccount[]>
  createMemberAccount(
    actor: MemberManagementActor,
    input: CreateManagedMemberInput,
  ): Promise<LinkedManagedMemberAccount>
  createLinkedMember(
    actor: MemberManagementActor,
    input: CreateLinkedMemberInput,
  ): Promise<OrganizationRecord<'member'>>
  updateMemberStatus(
    actor: MemberManagementActor,
    input: UpdateMemberStatusInput,
  ): Promise<OrganizationRecord<'member'>>
  updateAccountAccess(actor: MemberManagementActor, input: UpdateAccountAccessInput): Promise<AuthUserAccount>
}

export class MemberManagementAuthorizationError extends Error {
  constructor() {
    super('Only admins can manage accounts and Members.')
    this.name = 'MemberManagementAuthorizationError'
  }
}

export function createMemberManagementService({
  authGateway,
  memberRegistry,
}: {
  authGateway: AuthAdminGateway
  memberRegistry: MemberRegistry
}): MemberManagementService {
  const lifecycle = createMemberAccountLifecycle({ authGateway, memberRegistry })

  return {
    async listManagedMembers(actor) {
      assertAdmin(actor)
      return lifecycle.listManagedAccounts()
    },
    async createMemberAccount(actor, input) {
      assertAdmin(actor)
      return lifecycle.createManagedAccount(input)
    },
    async createLinkedMember(actor, input) {
      assertAdmin(actor)
      return lifecycle.createLinkedMember(input)
    },
    async updateMemberStatus(actor, input) {
      assertAdmin(actor)
      return lifecycle.updateMemberStatus(input)
    },
    async updateAccountAccess(actor, input) {
      assertAdmin(actor)
      return lifecycle.updateAccountAccess(input)
    },
  }
}

export type {
  AccountAccessState,
  AuthAdminGateway,
  AuthUserAccount,
  CreateLinkedMemberInput,
  CreateManagedMemberInput,
  LinkedManagedMemberAccount,
  ManagedMemberAccount,
  UpdateAccountAccessInput,
  UpdateMemberStatusInput,
}

function assertAdmin(actor: MemberManagementActor | null | undefined) {
  if (!canManageMembers(actor)) {
    throw new MemberManagementAuthorizationError()
  }
}

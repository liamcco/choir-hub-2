import type { MemberRegistry, OrganizationRecord } from '@/organization'
import { MemberStatus } from '@/prisma/generated/client'

export type ManagedAccountRole = 'admin' | 'user'

export type AuthUserAccount = {
  id: string
  name: string
  email: string
  role?: string | null
  banned?: boolean | null
  banReason?: string | null
  banExpires?: Date | null
  createdAt: Date
}

export type AccountAccessState = 'enabled' | 'disabled'
export type AccountLinkState = 'linked' | 'unlinked'

export type CreateManagedMemberInput = {
  name: string
  email: string
  password: string
  status: MemberStatus
}

export type CreateLinkedMemberInput = {
  userId: string
  status: MemberStatus
}

export type UpdateMemberStatusInput = {
  memberId: string
  status: MemberStatus
}

export type UpdateAccountAccessInput = {
  userId: string
  accessState: AccountAccessState
}

export type LinkedManagedMemberAccount = {
  user: AuthUserAccount
  member: OrganizationRecord<'member'>
  linkState: 'linked'
  accessState: AccountAccessState
}

export type UnlinkedManagedMemberAccount = {
  user: AuthUserAccount
  member: null
  linkState: 'unlinked'
  accessState: AccountAccessState
}

export type ManagedMemberAccount = LinkedManagedMemberAccount | UnlinkedManagedMemberAccount

export type AuthAdminGateway = {
  listUsers(): Promise<AuthUserAccount[]>
  createUser(input: {
    name: string
    email: string
    password: string
    role: ManagedAccountRole
  }): Promise<AuthUserAccount>
  deleteUser(userId: string): Promise<void>
  setAccessState(userId: string, state: AccountAccessState): Promise<AuthUserAccount>
}

export type MemberAccountLifecycle = {
  listManagedAccounts(): Promise<ManagedMemberAccount[]>
  createManagedAccount(input: CreateManagedMemberInput): Promise<LinkedManagedMemberAccount>
  createLinkedMember(input: CreateLinkedMemberInput): Promise<OrganizationRecord<'member'>>
  updateMemberStatus(input: UpdateMemberStatusInput): Promise<OrganizationRecord<'member'>>
  updateAccountAccess(input: UpdateAccountAccessInput): Promise<AuthUserAccount>
}

export function createMemberAccountLifecycle({
  authGateway,
  memberRegistry,
}: {
  authGateway: AuthAdminGateway
  memberRegistry: MemberRegistry
}): MemberAccountLifecycle {
  return {
    async listManagedAccounts() {
      const [users, members] = await Promise.all([authGateway.listUsers(), memberRegistry.listMembers()])
      const membersByUserId = new Map(members.map((member) => [member.userId, member]))

      return users.map((user) => toManagedMemberAccount(user, membersByUserId.get(user.id) ?? null))
    },
    async createManagedAccount(input) {
      const user = await authGateway.createUser({
        name: normalizeName(input.name),
        email: normalizeEmail(input.email),
        password: input.password,
        role: 'user',
      })

      let member: OrganizationRecord<'member'>
      try {
        member = await memberRegistry.createMember({
          userId: user.id,
          status: input.status ?? MemberStatus.ACTIVE,
        })
      } catch (error) {
        await authGateway.deleteUser(user.id)
        throw error
      }

      return {
        user,
        member,
        linkState: 'linked',
        accessState: accountAccessStateFor(user),
      }
    },
    async createLinkedMember(input) {
      return memberRegistry.createMember({
        userId: input.userId,
        status: input.status ?? MemberStatus.ACTIVE,
      })
    },
    async updateMemberStatus(input) {
      return memberRegistry.updateMember(input.memberId, { status: input.status })
    },
    async updateAccountAccess(input) {
      return authGateway.setAccessState(input.userId, input.accessState)
    },
  }
}

function toManagedMemberAccount(
  user: AuthUserAccount,
  member: OrganizationRecord<'member'> | null,
): ManagedMemberAccount {
  if (member) {
    return {
      user,
      member,
      linkState: 'linked',
      accessState: accountAccessStateFor(user),
    }
  }

  return {
    user,
    member: null,
    linkState: 'unlinked',
    accessState: accountAccessStateFor(user),
  }
}

function accountAccessStateFor(user: AuthUserAccount): AccountAccessState {
  return user.banned ? 'disabled' : 'enabled'
}

function normalizeName(name: string) {
  return name.trim()
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

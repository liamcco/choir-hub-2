import { beforeEach, describe, expect, test } from 'bun:test'
import {
  type AccountAccessState,
  type AuthAdminGateway,
  type AuthUserAccount,
  createMemberAccountLifecycle,
} from '@/admin/member-management/account-lifecycle'
import { toAuthUserAccount, toBetterAuthCreateUserBody } from '@/admin/member-management/better-auth-gateway'
import { createMemberManagementService, MemberManagementAuthorizationError } from '@/admin/member-management/service'
import type { MemberRegistry, OrganizationRecord } from '@/organization'
import { MemberStatus } from '@/prisma/generated/client'

class InMemoryMemberRegistry implements MemberRegistry {
  private members: OrganizationRecord<'member'>[] = []
  private nextId = 1

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

  private id() {
    return `member-${this.nextId++}`
  }
}

class InMemoryAuthAdminGateway implements AuthAdminGateway {
  private users: AuthUserAccount[] = []
  deletedUserIds: string[] = []
  private nextId = 1

  async listUsers() {
    return [...this.users]
  }

  async createUser(input: { name: string; email: string; password: string; role: 'admin' | 'user' }) {
    const user = {
      id: this.id(),
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role,
      banned: false,
      banReason: null,
      banExpires: null,
      createdAt: new Date(),
    }
    this.users.push(user)
    return user
  }

  async deleteUser(userId: string) {
    this.deletedUserIds.push(userId)
    this.users = this.users.filter((candidate) => candidate.id !== userId)
  }

  async setAccessState(userId: string, state: AccountAccessState) {
    const user = this.users.find((candidate) => candidate.id === userId)
    if (!user) {
      throw new Error(`Missing user ${userId}`)
    }
    user.banned = state === 'disabled'
    user.banReason = state === 'disabled' ? 'Access disabled by an admin.' : null
    user.banExpires = null
    return user
  }

  private id() {
    return `user-${this.nextId++}`
  }
}

let memberRegistry: InMemoryMemberRegistry
let authGateway: InMemoryAuthAdminGateway

beforeEach(() => {
  memberRegistry = new InMemoryMemberRegistry()
  authGateway = new InMemoryAuthAdminGateway()
})

describe('Member account lifecycle', () => {
  test('creates an auth User and linked skeletal Member', async () => {
    const lifecycle = createLifecycle()

    const result = await lifecycle.createManagedAccount({
      name: ' Ada Lovelace ',
      email: ' ADA@EXAMPLE.COM ',
      password: 'correct horse battery staple',
      status: MemberStatus.PASSIVE,
    })

    expect(result.user).toMatchObject({
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      role: 'user',
      banned: false,
    })
    expect(result.member).toMatchObject({
      userId: result.user.id,
      status: MemberStatus.PASSIVE,
    })
    expect(await lifecycle.listManagedAccounts()).toEqual([
      {
        user: result.user,
        member: result.member,
        linkState: 'linked',
        accessState: 'enabled',
      },
    ])
  })

  test('updates Member Status independently from account access state', async () => {
    const lifecycle = createLifecycle()
    const created = await lifecycle.createManagedAccount({
      name: 'Grace Hopper',
      email: 'grace@example.com',
      password: 'correct horse battery staple',
      status: MemberStatus.ACTIVE,
    })

    const updatedMember = await lifecycle.updateMemberStatus({
      memberId: created.member.id,
      status: MemberStatus.FORMER,
    })

    expect(updatedMember).toMatchObject({
      id: created.member.id,
      status: MemberStatus.FORMER,
      userId: created.user.id,
    })
    expect((await lifecycle.listManagedAccounts())[0]?.accessState).toBe('enabled')
  })

  test('creates a linked skeletal Member for an existing auth User', async () => {
    const lifecycle = createLifecycle()
    const user = await authGateway.createUser({
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'correct horse battery staple',
      role: 'user',
    })

    const member = await lifecycle.createLinkedMember({
      userId: user.id,
      status: MemberStatus.ACTIVE,
    })

    expect(member).toMatchObject({
      userId: user.id,
      status: MemberStatus.ACTIVE,
    })
    expect(await lifecycle.listManagedAccounts()).toEqual([
      {
        user,
        member,
        linkState: 'linked',
        accessState: 'enabled',
      },
    ])
  })

  test('removes the auth User when linked Member creation fails for a new account', async () => {
    const lifecycle = createMemberAccountLifecycle({
      authGateway,
      memberRegistry: {
        listMembers: () => memberRegistry.listMembers(),
        createMember: async () => {
          throw new Error('Member creation failed')
        },
        updateMember: (id, input) => memberRegistry.updateMember(id, input),
      },
    })

    await expect(
      lifecycle.createManagedAccount({
        name: 'Rollback User',
        email: 'rollback@example.com',
        password: 'correct horse battery staple',
        status: MemberStatus.ACTIVE,
      }),
    ).rejects.toThrow('Member creation failed')
    expect(authGateway.deletedUserIds).toEqual(['user-1'])
    expect(await authGateway.listUsers()).toEqual([])
  })

  test('uses auth account capabilities to disable and re-enable access', async () => {
    const lifecycle = createLifecycle()
    const created = await lifecycle.createManagedAccount({
      name: 'Katherine Johnson',
      email: 'katherine@example.com',
      password: 'correct horse battery staple',
      status: MemberStatus.ACTIVE,
    })

    await lifecycle.updateAccountAccess({
      userId: created.user.id,
      accessState: 'disabled',
    })
    expect((await lifecycle.listManagedAccounts())[0]).toMatchObject({
      accessState: 'disabled',
      linkState: 'linked',
      user: expect.objectContaining({ banned: true }),
    })

    await lifecycle.updateAccountAccess({
      userId: created.user.id,
      accessState: 'enabled',
    })
    expect((await lifecycle.listManagedAccounts())[0]).toMatchObject({
      accessState: 'enabled',
      linkState: 'linked',
      user: expect.objectContaining({ banned: false }),
    })
  })

  test('represents unlinked accounts through lifecycle state', async () => {
    const lifecycle = createLifecycle()
    const user = await authGateway.createUser({
      name: 'Unlinked User',
      email: 'unlinked@example.com',
      password: 'correct horse battery staple',
      role: 'user',
    })

    await expect(lifecycle.listManagedAccounts()).resolves.toEqual([
      {
        user,
        member: null,
        linkState: 'unlinked',
        accessState: 'enabled',
      },
    ])
  })

  test('normalizes the real Better Auth admin user shape at the auth adapter seam', () => {
    expect(
      toAuthUserAccount({
        id: 'user-admin',
        name: 'Admin User',
        email: 'admin@example.com',
        role: ['admin', 'user'],
        banned: false,
        banReason: null,
        banExpires: '2027-01-02T03:04:05.000Z',
        createdAt: '2026-07-18T12:34:56.000Z',
      }),
    ).toEqual({
      id: 'user-admin',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin,user',
      banned: false,
      banReason: null,
      banExpires: new Date('2027-01-02T03:04:05.000Z'),
      createdAt: new Date('2026-07-18T12:34:56.000Z'),
    })
  })

  test('marks admin-created auth Users email-verified so production login is available', () => {
    expect(
      toBetterAuthCreateUserBody({
        name: 'Verified User',
        email: 'verified@example.com',
        password: 'correct horse battery staple',
        role: 'user',
      }),
    ).toEqual({
      name: 'Verified User',
      email: 'verified@example.com',
      password: 'correct horse battery staple',
      role: 'user',
      data: {
        emailVerified: true,
      },
    })
  })
})

describe('admin Member account management service', () => {
  test('rejects non-admin writes and reads', async () => {
    const service = createService()

    await expect(
      service.createMemberAccount(
        { id: 'user-regular', role: 'user' },
        {
          name: 'Denied User',
          email: 'denied@example.com',
          password: 'correct horse battery staple',
          status: MemberStatus.ACTIVE,
        },
      ),
    ).rejects.toBeInstanceOf(MemberManagementAuthorizationError)
    await expect(service.listManagedMembers({ id: 'user-regular', role: 'user' })).rejects.toBeInstanceOf(
      MemberManagementAuthorizationError,
    )
  })
})

function createLifecycle() {
  return createMemberAccountLifecycle({
    authGateway,
    memberRegistry,
  })
}

function createService() {
  return createMemberManagementService({
    authGateway,
    memberRegistry,
  })
}

import 'server-only'

import { memberAccountLifecycle } from '@/features/organization/core/member-account-lifecycle'
import type { MemberStatus } from '@/prisma/generated/client'

export type {
  AuthUserAccount,
  ManagedMemberAccount,
} from '@/features/organization/core/member-account-lifecycle'

export const listManagedMembers = () => memberAccountLifecycle.listManagedMembers()

export const createMemberAccount = (input: { name: string; email: string; password: string; status: MemberStatus }) =>
  memberAccountLifecycle.createMemberAccount(input)

export const createLinkedMember = (userId: string, status: MemberStatus) =>
  memberAccountLifecycle.createLinkedMember(userId, status)

export const updateMemberStatus = (memberId: string, status: MemberStatus) =>
  memberAccountLifecycle.updateMemberStatus(memberId, status)

export const updateAccountAccess = (userId: string, accessState: 'enabled' | 'disabled') =>
  memberAccountLifecycle.updateAccountAccess(userId, accessState)

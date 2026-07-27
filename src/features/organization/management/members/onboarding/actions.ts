'use server'

import { requireAdmin } from '@/core/auth/permissions.server'
import { userOnboarding } from './index'

export async function resendInvitationAction(userId: string) {
  const actor = await requireAdmin()
  return userOnboarding.resendActivationLink(userId, actor.userId)
}

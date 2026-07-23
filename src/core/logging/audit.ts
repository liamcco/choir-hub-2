import type { AuthorizationDeniedContext } from '@/core/auth/permissions.server'
import { logger } from './logger'

type AuditSubject = {
  type: string
  id: string
}

export const audit = {
  authorizationDenied(context: AuthorizationDeniedContext) {
    logger.warn('audit.authorization.denied', { actor: context.actor, requirement: context.requirement })
  },

  adminActionCompleted(input: { actorUserId: string; action: string; subject: AuditSubject }) {
    logger.info('audit.admin.action.completed', {
      actorUserId: input.actorUserId,
      action: input.action,
      subject: input.subject,
    })
  },

  accountAccessChanged(input: { actorUserId?: string; action: string; subjectUserId: string }) {
    logger.info('audit.account.access.changed', {
      ...(input.actorUserId ? { actorUserId: input.actorUserId } : {}),
      action: input.action,
      subject: { type: 'user', id: input.subjectUserId },
    })
  },
}

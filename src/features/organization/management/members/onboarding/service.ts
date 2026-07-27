import 'server-only'

import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/core/auth/auth'
import { db } from '@/core/db'
import { audit, logger } from '@/core/logging'
import { type ChoirId, resolveChoir, resolveSection, type SectionId } from '@/core/topology'
import { type FineVoice, isFineVoice } from '@/core/types'
import { type MemberStatus, user } from '@/drizzle/schema'
import { homePlacement } from '@/features/organization/core/home-placement'
import { users } from '@/features/organization/core/members'
import { isEmail } from '@/shared/validation'

const ACTIVATION_PATH = '/activate'
const memberStatuses = ['ACTIVE', 'PASSIVE', 'FORMER'] as const

export type OnboardingPlacement = {
  choirId: ChoirId
  sectionId: SectionId
  voice: FineVoice
  label?: string
}

export type UserOnboardingPlan = {
  row?: number
  name: string
  email: string
  status: MemberStatus
  placement?: OnboardingPlacement | null
}

export type OnboardingValidationError = {
  row?: number
  field?: 'name' | 'email' | 'status' | 'placement'
  message: string
}

export type OnboardingValidation = {
  plans: UserOnboardingPlan[]
  errors: OnboardingValidationError[]
}

export type UserOnboardingOutcome =
  | {
      status: 'created'
      row?: number
      id: string
      name: string
      email: string
      invitationSent: boolean
    }
  | {
      status: 'failed'
      row?: number
      name: string
      email: string
      message: string
      field?: 'name' | 'email' | 'status' | 'placement'
      cleanup: 'not-needed' | 'completed' | 'failed'
      userId?: string
    }

export type UserOnboardingBatchResult = {
  validationErrors: OnboardingValidationError[]
  outcomes: UserOnboardingOutcome[]
}

export const userOnboarding = {
  validateBatch,
  onboardBatch,
  resendActivationLink,
}

async function validateBatch(input: readonly UserOnboardingPlan[]): Promise<OnboardingValidation> {
  const plans = input.map(normalizePlan)
  const errors: OnboardingValidationError[] = []
  const emails = new Map<string, number | undefined>()

  if (plans.length === 0) errors.push({ message: 'The onboarding batch contains no Users.' })

  for (const plan of plans) {
    const row = plan.row === undefined ? {} : { row: plan.row }
    if (!plan.name) errors.push({ ...row, field: 'name', message: 'Name is required.' })
    if (!isEmail(plan.email)) errors.push({ ...row, field: 'email', message: 'A valid email address is required.' })

    const previousRow = emails.get(plan.email)
    if (previousRow !== undefined || emails.has(plan.email)) {
      errors.push({
        ...row,
        field: 'email',
        message: `Email is duplicated with row ${previousRow ?? 'another row'}.`,
      })
    } else if (plan.email) emails.set(plan.email, plan.row)

    if (!memberStatuses.includes(plan.status)) {
      errors.push({ ...row, field: 'status', message: 'Choose a valid Member Status.' })
    }

    if (plan.placement) errors.push(...validatePlacement(plan.placement, row))
  }

  if (errors.length === 0) {
    const existing = await db.select({ email: user.email }).from(user)
    const existingEmails = new Set(existing.map((item) => item.email.toLowerCase()))
    for (const plan of plans) {
      if (existingEmails.has(plan.email)) {
        errors.push({
          ...(plan.row === undefined ? {} : { row: plan.row }),
          field: 'email',
          message: 'Email is already registered.',
        })
      }
    }
  }

  return { plans, errors }
}

async function onboardBatch(
  input: readonly UserOnboardingPlan[],
  actorUserId: string,
): Promise<UserOnboardingBatchResult> {
  const validation = await validateBatch(input)
  if (validation.errors.length > 0) return { validationErrors: validation.errors, outcomes: [] }

  const outcomes: UserOnboardingOutcome[] = []
  for (const plan of validation.plans) {
    outcomes.push(await onboardOne(plan, actorUserId))
  }
  return { validationErrors: [], outcomes }
}

async function resendActivationLink(userId: string, actorUserId: string) {
  const [account] = await db
    .select({ email: user.email, emailVerified: user.emailVerified })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (!account || account.emailVerified) {
    return { success: false, message: 'This User no longer needs an activation link.' }
  }

  const sent = await sendActivationLink(account.email, {
    actorUserId,
    operation: 'resend',
    userId,
  })
  if (sent) {
    audit.adminActionCompleted({
      actorUserId,
      action: 'user.invitation.resend',
      subject: { type: 'user', id: userId },
    })
  }
  return sent
    ? { success: true, message: 'Activation link sent.' }
    : { success: false, message: 'The activation link could not be sent.' }
}

async function onboardOne(plan: UserOnboardingPlan, actorUserId: string): Promise<UserOnboardingOutcome> {
  let createdUserId: string | undefined
  let phase = 'create-user'

  try {
    const result = await auth.api.createUser({
      headers: await headers(),
      body: {
        name: plan.name,
        email: plan.email,
        role: 'user',
        data: { emailVerified: false },
      },
    })
    createdUserId = result.user.id

    phase = 'save-member-status'
    const member = await users.updateMemberStatus(createdUserId, plan.status)
    if (!member) throw new Error('The User could not be saved.')

    if (plan.placement) {
      phase = 'create-choir-membership'
      await homePlacement.startChoirMembership({
        userId: createdUserId,
        choirId: plan.placement.choirId,
      })
      phase = 'create-section-placement'
      await homePlacement.startSectionPlacement({
        userId: createdUserId,
        sectionId: plan.placement.sectionId,
        voice: plan.placement.voice,
      })
    }

    audit.adminActionCompleted({
      actorUserId,
      action: 'user.create',
      subject: { type: 'user', id: createdUserId },
    })
    audit.accountAccessChanged({ actorUserId, action: 'account.create', subjectUserId: createdUserId })

    const invitationSent = await sendActivationLink(plan.email, {
      actorUserId,
      operation: 'initial',
      userId: createdUserId,
    })
    return {
      status: 'created',
      ...(plan.row === undefined ? {} : { row: plan.row }),
      id: createdUserId,
      name: plan.name,
      email: plan.email,
      invitationSent,
    }
  } catch (error) {
    let cleanupStatus: 'not-needed' | 'completed' | 'failed' = 'not-needed'
    if (createdUserId) {
      try {
        await auth.api.removeUser({ headers: await headers(), body: { userId: createdUserId } })
        cleanupStatus = 'completed'
      } catch (cleanupError) {
        cleanupStatus = 'failed'
        logger.error('organization.user.onboarding.cleanup.failed', {
          actorUserId,
          userId: createdUserId,
          phase,
          error: errorMessage(cleanupError),
        })
      }
    }

    const message = errorMessage(error)
    logger.error('organization.user.onboarding.failed', {
      actorUserId,
      ...(plan.row === undefined ? {} : { row: plan.row }),
      email: plan.email,
      phase,
      cleanup: cleanupStatus,
      error: message,
    })
    return {
      status: 'failed',
      ...(plan.row === undefined ? {} : { row: plan.row }),
      name: plan.name,
      email: plan.email,
      message: cleanupStatus === 'failed' ? `${message} The newly created User could not be removed.` : message,
      field: fieldForPhase(phase),
      cleanup: cleanupStatus,
      ...(cleanupStatus === 'failed' && createdUserId ? { userId: createdUserId } : {}),
    }
  }
}

async function sendActivationLink(
  email: string,
  context: { actorUserId: string; operation: 'initial' | 'resend'; userId: string },
) {
  try {
    await auth.api.signInMagicLink({
      headers: await headers(),
      body: { email, callbackURL: ACTIVATION_PATH, errorCallbackURL: ACTIVATION_PATH },
    })
    return true
  } catch (error) {
    logger.error('organization.user.onboarding.activation-link.failed', {
      ...context,
      email,
      error: errorMessage(error),
    })
    return false
  }
}

function validatePlacement(placement: OnboardingPlacement, row: { row?: number }) {
  const errors: OnboardingValidationError[] = []
  const choir = resolveChoir(placement.choirId)
  const section = resolveSection(placement.sectionId)
  if (choir?.status !== 'active') {
    errors.push({ ...row, field: 'placement', message: 'Choose an existing Choir.' })
  }
  if (section?.status !== 'active') {
    errors.push({ ...row, field: 'placement', message: 'Choose an existing Section.' })
  } else if (section.choirId !== placement.choirId) {
    errors.push({ ...row, field: 'placement', message: 'Choose a Section from the selected Choir.' })
  } else if (!isFineVoice(placement.voice) || !section.allowedVoices.includes(placement.voice)) {
    errors.push({ ...row, field: 'placement', message: 'Choose a Voice allowed by the Section.' })
  }
  return errors
}

function normalizePlan(plan: UserOnboardingPlan): UserOnboardingPlan {
  return {
    ...plan,
    name: plan.name.trim(),
    email: plan.email.trim().toLowerCase(),
  }
}

function fieldForPhase(phase: string): 'name' | 'email' | 'status' | 'placement' | undefined {
  if (phase === 'create-user') return 'email'
  if (phase === 'save-member-status') return 'status'
  if (phase === 'create-choir-membership' || phase === 'create-section-placement') return 'placement'
  return undefined
}

function errorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : 'User onboarding failed.'
}

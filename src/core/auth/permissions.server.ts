import { headers } from 'next/headers'
import { auth } from '@/core/auth/auth'
import { ACCESS_ROLES, type AccessRole, type GlobalPermissionRequest } from '@/core/auth/permissions'
import { prisma } from '@/core/db'
import { audit } from '@/core/logging'

type RequestActor = {
  userId: string
  roles: AccessRole[]
}

type ExactGlobalPermissionRequest<Request extends GlobalPermissionRequest> = Request &
  Record<Exclude<keyof Request, keyof GlobalPermissionRequest>, never>

export type AuthorizationActorContext = { state: 'authenticated'; userId: string } | { state: 'unauthenticated' }
export type AuthenticatedAuthorizationActorContext = Extract<AuthorizationActorContext, { state: 'authenticated' }>

export type AuthorizationRequirement =
  | { kind: 'permission'; permission: GlobalPermissionRequest }
  | { kind: 'accessRole'; role: AccessRole }
  | { kind: 'currentGroupMembership'; groupId: string }
  | { kind: 'currentPositionAssignment'; positionId: string }

export type AuthorizationDeniedContext = {
  actor: AuthorizationActorContext
  requirement: AuthorizationRequirement
}

export class AuthorizationDeniedError extends Error {
  readonly code = 'AUTHORIZATION_DENIED'

  constructor(readonly context: AuthorizationDeniedContext) {
    super('The current actor is not authorized to perform this operation.')
    this.name = 'AuthorizationDeniedError'
  }
}

function denyAuthorization(context: AuthorizationDeniedContext): never {
  audit.authorizationDenied(context)
  throw new AuthorizationDeniedError(context)
}

function parseAccessRoles(value: unknown): AccessRole[] {
  const storedRoles = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : ['user']
  const knownRoles = new Set<string>(ACCESS_ROLES)

  return storedRoles
    .map((role) => (typeof role === 'string' ? role.trim() : ''))
    .filter((role): role is AccessRole => knownRoles.has(role))
}

async function getCurrentActor(): Promise<RequestActor | null> {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return null
  }

  return {
    userId: session.user.id,
    roles: parseAccessRoles(session.user.role),
  }
}

async function getCurrentUserId(): Promise<string | null> {
  const actor = await getCurrentActor()
  return actor?.userId ?? null
}

export async function canCurrentUserInGroup(input: { groupId: string }): Promise<boolean> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return false
  }

  const now = new Date()
  const membership = await prisma.groupMembership.findFirst({
    where: {
      userId,
      groupId: input.groupId,
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    select: { id: true },
  })

  return membership !== null
}

export async function requireCurrentUserInGroup(input: { groupId: string }): Promise<void> {
  if (!(await canCurrentUserInGroup(input))) {
    const actor = await getCurrentActor()
    denyAuthorization({
      actor: actorContext(actor),
      requirement: { kind: 'currentGroupMembership', groupId: input.groupId },
    })
  }
}

export async function canCurrentUserHoldPosition(input: { positionId: string }): Promise<boolean> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return false
  }

  const now = new Date()
  const assignment = await prisma.positionAssignment.findFirst({
    where: {
      userId,
      positionId: input.positionId,
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    select: { id: true },
  })

  return assignment !== null
}

export async function requireCurrentUserHoldsPosition(input: { positionId: string }): Promise<void> {
  if (!(await canCurrentUserHoldPosition(input))) {
    const actor = await getCurrentActor()
    denyAuthorization({
      actor: actorContext(actor),
      requirement: { kind: 'currentPositionAssignment', positionId: input.positionId },
    })
  }
}

function getActorFromSession(session?: { user: { id: string; role?: string | null } } | null): RequestActor | null {
  if (!session) {
    return null
  }

  return {
    userId: session.user.id,
    roles: parseAccessRoles(session.user.role),
  }
}

function actorContext(actor: RequestActor | null): AuthorizationActorContext {
  return actor ? { state: 'authenticated', userId: actor.userId } : { state: 'unauthenticated' }
}

async function actorHasPermission(actor: RequestActor | null, permission: GlobalPermissionRequest): Promise<boolean> {
  if (!actor) {
    return false
  }

  const result = await auth.api.userHasPermission({
    body: {
      userId: actor.userId,
      permissions: {
        [permission.resource]: [permission.action],
      },
    },
  })

  return result.success
}

function actorIsAdmin(actor: RequestActor | null): boolean {
  return actor?.roles.includes('admin') ?? false
}

export async function canCurrentUser<const Request extends GlobalPermissionRequest>(
  permission: ExactGlobalPermissionRequest<Request>,
): Promise<boolean> {
  return actorHasPermission(await getCurrentActor(), permission)
}

export async function userIsAdmin(): Promise<boolean> {
  return actorIsAdmin(await getCurrentActor())
}

export async function requireCurrentUserPermission<const Request extends GlobalPermissionRequest>(
  permission: ExactGlobalPermissionRequest<Request>,
): Promise<AuthenticatedAuthorizationActorContext> {
  const actor = await getCurrentActor()

  if (!actor || !(await actorHasPermission(actor, permission))) {
    denyAuthorization({
      actor: actorContext(actor),
      requirement: { kind: 'permission', permission },
    })
  }

  return { state: 'authenticated', userId: actor.userId }
}

export async function requireAdmin(
  session?: { user: { id: string; role?: string | null } } | null,
): Promise<AuthenticatedAuthorizationActorContext> {
  const actor = getActorFromSession(session) ?? (await getCurrentActor())

  if (!actor || !actorIsAdmin(actor)) {
    denyAuthorization({
      actor: actorContext(actor),
      requirement: { kind: 'accessRole', role: 'admin' },
    })
  }

  return { state: 'authenticated', userId: actor.userId }
}

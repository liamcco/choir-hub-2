import { headers } from 'next/headers'
import { auth } from '@/core/auth/auth'
import { ACCESS_ROLES, type AccessRole, type GlobalPermissionRequest } from '@/core/auth/permissions'

type RequestActor = {
  userId: string
  roles: AccessRole[]
}

type ExactGlobalPermissionRequest<Request extends GlobalPermissionRequest> = Request &
  Record<Exclude<keyof Request, keyof GlobalPermissionRequest>, never>

export type AuthorizationActorContext = { state: 'authenticated'; userId: string } | { state: 'unauthenticated' }

export type AuthorizationRequirement =
  | { kind: 'permission'; permission: GlobalPermissionRequest }
  | { kind: 'accessRole'; role: AccessRole }

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
): Promise<void> {
  const actor = await getCurrentActor()

  if (!(await actorHasPermission(actor, permission))) {
    throw new AuthorizationDeniedError({
      actor: actorContext(actor),
      requirement: { kind: 'permission', permission },
    })
  }
}

export async function requireAdmin(session?: { user: { id: string; role?: string | null } } | null): Promise<void> {
  const actor = getActorFromSession(session) ?? (await getCurrentActor())

  if (!actorIsAdmin(actor)) {
    throw new AuthorizationDeniedError({
      actor: actorContext(actor),
      requirement: { kind: 'accessRole', role: 'admin' },
    })
  }
}

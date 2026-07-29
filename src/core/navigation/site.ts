export const ROUTES = {
  home: '/',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  account: '/account',
  adminRoot: '/admin',
  adminUsers: '/admin/users',
  adminGroups: '/admin/groups',
  adminPositions: '/admin/positions',
  adminPlacement: '/admin/placement',
} as const

export type RouteId = keyof typeof ROUTES
export type NavigationRouteId = Exclude<RouteId, 'adminRoot' | 'home'>

export function isSafeInternalPath(path: string | undefined): path is string {
  return Boolean(path?.startsWith('/') && !path.startsWith('//') && !path.includes('\\'))
}

export function getPostLoginPath(role: string | null | undefined, returnTo?: string) {
  if (isSafeInternalPath(returnTo)) return returnTo
  return role === 'admin' ? ROUTES.adminRoot : ROUTES.home
}

export function loginPath(returnTo?: string) {
  return isSafeInternalPath(returnTo) ? `${ROUTES.login}?returnTo=${encodeURIComponent(returnTo)}` : ROUTES.login
}

export function adminUserPath(userId: string) {
  return adminDetailPath(ROUTES.adminUsers, userId)
}

export function adminGroupPath(groupId: string) {
  return adminDetailPath(ROUTES.adminGroups, groupId)
}

export function adminPositionPath(positionId: string) {
  return adminDetailPath(ROUTES.adminPositions, positionId)
}

export function adminPlacementUserPath(userId: string) {
  return adminDetailPath(ROUTES.adminPlacement, userId)
}

function adminDetailPath(collectionPath: string, detailId: string) {
  return `${collectionPath}?detail=${encodeURIComponent(detailId)}`
}

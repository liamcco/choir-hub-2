export const ROUTES = {
  home: '/',
  login: '/login',
  account: '/account',
  adminRoot: '/admin',
  adminUsers: '/admin/users',
  adminGroups: '/admin/groups',
  adminPositions: '/admin/positions',
} as const

export type RouteId = keyof typeof ROUTES
export type NavigationRouteId = Exclude<RouteId, 'adminRoot' | 'home'>

export function adminUserPath(userId: string) {
  return adminDetailPath(ROUTES.adminUsers, userId)
}

export function adminGroupPath(groupId: string) {
  return adminDetailPath(ROUTES.adminGroups, groupId)
}

export function adminPositionPath(positionId: string) {
  return adminDetailPath(ROUTES.adminPositions, positionId)
}

function adminDetailPath(collectionPath: string, detailId: string) {
  return `${collectionPath}?detail=${encodeURIComponent(detailId)}`
}

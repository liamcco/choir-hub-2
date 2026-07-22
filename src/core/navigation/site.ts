export const ROUTES = {
  home: '/',
  login: '/login',
  organization: '/organization',
  account: '/account',
  adminRoot: '/admin',
  adminMembers: '/admin/members',
  adminGroups: '/admin/groups',
  adminGroupHierarchy: '/admin/groups/hierarchy',
  adminPositions: '/admin/positions',
} as const

export type RouteId = keyof typeof ROUTES
export type NavigationRouteId = Exclude<RouteId, 'adminRoot' | 'adminGroupHierarchy' | 'home'>

export function adminMemberPath(memberId: string) {
  return adminDetailPath(ROUTES.adminMembers, memberId)
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

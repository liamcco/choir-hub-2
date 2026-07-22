export const ROUTES = {
  home: '/',
  login: '/login',
  organization: '/organization',
  account: '/account',
  adminRoot: '/admin',
  adminMembers: '/admin/members',
  adminMemberCreate: '/admin/members/new',
  adminGroups: '/admin/groups',
  adminGroupCreate: '/admin/groups/new',
  adminGroupHierarchy: '/admin/groups/hierarchy',
  adminGroupMemberships: '/admin/group-memberships',
  adminPositions: '/admin/positions',
  adminPositionCreate: '/admin/positions/new',
  adminPositionAssignments: '/admin/position-assignments',
} as const

export type RouteId = keyof typeof ROUTES
export type NavigationRouteId = Exclude<
  RouteId,
  'adminRoot' | 'adminMemberCreate' | 'adminGroupCreate' | 'adminGroupHierarchy' | 'adminPositionCreate' | 'home'
>

export function adminMemberPath(memberId: string) {
  return `${ROUTES.adminMembers}/${encodeURIComponent(memberId)}`
}

export function adminGroupPath(groupId: string) {
  return `${ROUTES.adminGroups}/${encodeURIComponent(groupId)}`
}

export function adminPositionPath(positionId: string) {
  return `${ROUTES.adminPositions}/${encodeURIComponent(positionId)}`
}

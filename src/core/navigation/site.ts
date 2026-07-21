export const ROUTES = {
  home: '/',
  login: '/login',
  organization: '/organization',
  account: '/account',
  adminRoot: '/admin',
  adminMembers: '/admin/members',
  adminMemberCreate: '/admin/members/new',
  adminGroups: '/admin/groups',
  adminGroupMemberships: '/admin/group-memberships',
  adminPositions: '/admin/positions',
  adminPositionAssignments: '/admin/position-assignments',
} as const

export type RouteId = keyof typeof ROUTES
export type NavigationRouteId = Exclude<RouteId, 'adminRoot' | 'adminMemberCreate' | 'home'>

export function adminMemberPath(memberId: string) {
  return `${ROUTES.adminMembers}/${encodeURIComponent(memberId)}`
}

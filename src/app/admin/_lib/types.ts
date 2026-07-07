export type AdminActionState = {
  message?: string
  status: 'idle' | 'success' | 'error'
}

export type AdminUserSummary = {
  banned: boolean
  email: string
  emailVerified: boolean
  groupCount: number
  groupIds: string[]
  groupNames: string[]
  id: string
  image: string | null
  name: string
  positionCount: number
  role: string
  sessionCount: number
  username: string | null
}

export type AdminGroupKind = {
  description: string | null
  groupCount: number
  id: string
  name: string
}

export type AdminGroup = {
  description: string | null
  id: string
  isContainer: boolean
  kindId: string
  kindName: string
  memberCount: number
  name: string
  parentGroupId: string | null
  parentGroupName: string | null
  positionCount: number
}

export type AdminPosition = {
  currentHolderName: string | null
  currentHolderUserId: string | null
  description: string | null
  groupIds: string[]
  groupNames: string[]
  heldSince: string | null
  id: string
  name: string
}

export type AdminMembership = {
  addedAt: string
  groupId: string
  groupKindName: string
  groupName: string
  id: string
}

export type AdminUserPosition = {
  groupNames: string[]
  heldSince: string | null
  id: string
  name: string
}

export type AdminUserSession = {
  createdAt: string
  expiresAt: string
  id: string
  impersonatedBy: string | null
  ipAddress: string | null
  userAgent: string | null
}

export type AdminUserDetail = {
  banExpires: string | null
  banReason: string | null
  banned: boolean
  createdAt: string
  displayUsername: string | null
  email: string
  emailVerified: boolean
  id: string
  image: string | null
  memberships: AdminMembership[]
  name: string
  positions: AdminUserPosition[]
  role: string
  sessions: AdminUserSession[]
  twoFactorEnabled: boolean
  updatedAt: string
  username: string | null
}

export type AdminDashboardData = {
  currentAdminId: string
  groupKinds: AdminGroupKind[]
  groups: AdminGroup[]
  positions: AdminPosition[]
  users: AdminUserSummary[]
}

export type AdminMemberDetailData = AdminDashboardData & {
  selectedUser: AdminUserDetail | null
}

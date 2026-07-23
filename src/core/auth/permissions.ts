import { createAccessControl } from 'better-auth/plugins/access'
import { defaultRoles, defaultStatements } from 'better-auth/plugins/admin/access'

const APP_ACTIONS = ['read', 'create', 'update', 'delete'] as const

const customStatements = {
  group: APP_ACTIONS,
  groupMembership: APP_ACTIONS,
  position: APP_ACTIONS,
  positionAssignment: APP_ACTIONS,
} as const

export const statements = {
  ...defaultStatements, // user, session, and their native actions
  ...customStatements, // application resources
} as const

const accessControl = createAccessControl(statements)

export type PermissionResource = keyof typeof statements

export type PermissionAction<Resource extends PermissionResource> = (typeof statements)[Resource][number]

export type GlobalPermissionRequest = {
  [Resource in PermissionResource]: {
    resource: Resource
    action: PermissionAction<Resource>
  }
}[PermissionResource]

const noCustomPermissions = {
  group: [],
  groupMembership: [],
  position: [],
  positionAssignment: [],
} as const

export const accessRoles = {
  user: accessControl.newRole({
    ...defaultRoles.user.statements,
    ...noCustomPermissions,
  }),
  admin: accessControl.newRole({
    ...defaultRoles.admin.statements,
    ...customStatements,
  }),
} as const

export type AccessRole = keyof typeof accessRoles

export const adminPluginOptions = {
  ac: accessControl,
  roles: accessRoles,
  defaultRole: 'user',
  adminRoles: 'admin',
} as const

import { createAccessControl } from 'better-auth/plugins/access'
import { defaultRoles, defaultStatements } from 'better-auth/plugins/admin/access'

export const ACCESS_ROLES = ['user', 'admin'] as const
export const PERMISSION_RESOURCES = ['member', 'group', 'groupMembership', 'position', 'positionAssignment'] as const
export const PERMISSION_ACTIONS = ['read', 'create', 'update', 'delete'] as const
export const PERMISSION_SCOPE = 'global' as const

export type AccessRole = (typeof ACCESS_ROLES)[number]
export type PermissionResource = (typeof PERMISSION_RESOURCES)[number]
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number]
export type PermissionScope = typeof PERMISSION_SCOPE

export type GlobalPermissionRequest = {
  resource: PermissionResource
  action: PermissionAction
}

function permissionStatements<Actions extends readonly PermissionAction[]>(actions: Actions) {
  return Object.fromEntries(PERMISSION_RESOURCES.map((resource) => [resource, actions])) as Record<
    PermissionResource,
    Actions
  >
}

const organizationPermissions = permissionStatements(PERMISSION_ACTIONS)
const noOrganizationPermissions = permissionStatements([])

export const accessControl = createAccessControl({
  ...defaultStatements,
  ...organizationPermissions,
})

export const accessRoles = {
  user: accessControl.newRole({
    ...defaultRoles.user.statements,
    ...noOrganizationPermissions,
  }),
  admin: accessControl.newRole({
    ...defaultRoles.admin.statements,
    ...organizationPermissions,
  }),
} satisfies Record<AccessRole, ReturnType<typeof accessControl.newRole>>

export const adminPluginOptions = {
  ac: accessControl,
  roles: accessRoles,
  defaultRole: 'user',
  adminRoles: 'admin',
} as const

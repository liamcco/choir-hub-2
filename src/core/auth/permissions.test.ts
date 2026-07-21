import { describe, expect, test } from 'bun:test'
import {
  ACCESS_ROLES,
  accessControl,
  accessRoles,
  type GlobalPermissionRequest,
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
} from '@/core/auth/permissions'

describe('global permissions', () => {
  test('exposes the v1 access-control vocabulary', () => {
    expect(ACCESS_ROLES).toEqual(['user', 'admin'])
    expect(PERMISSION_RESOURCES).toEqual(['member', 'group', 'groupMembership', 'position', 'positionAssignment'])
    expect(PERMISSION_ACTIONS).toEqual(['read', 'create', 'update', 'delete'])
  })

  test('allows admins and denies plain users for organization management', () => {
    expect(accessRoles.admin.authorize({ group: ['update'] })).toEqual({ success: true })
    expect(accessRoles.user.authorize({ group: ['update'] })).toEqual({
      success: false,
      error: 'unauthorized to access resource "group"',
    })
  })

  test('keeps global permission requests free of choir-domain scope fields', () => {
    const request = { resource: 'group', action: 'update' } satisfies GlobalPermissionRequest

    // @ts-expect-error Global permissions do not accept choir-domain identifiers.
    const scopedRequest = { resource: 'group', action: 'update', groupId: 'group-1' } satisfies GlobalPermissionRequest

    expect(request).toEqual({ resource: 'group', action: 'update' })
    expect(scopedRequest.groupId).toBe('group-1')
    expect(accessControl.statements.group).toEqual(PERMISSION_ACTIONS)
  })
})

import { describe, expect, test } from 'bun:test'
import { accessRoles, type GlobalPermissionRequest } from '@/core/auth/permissions'

describe('global permissions', () => {
  test('exposes the application roles', () => {
    expect(Object.keys(accessRoles)).toEqual(['user', 'admin'])
  })

  test.each(['read', 'create', 'update', 'delete'] as const)('allows admins to %s groups', (action) => {
    expect(accessRoles.admin.authorize({ group: [action] })).toEqual({
      success: true,
    })
  })

  test.each(['read', 'create', 'update', 'delete'] as const)(
    'denies plain users the ability to %s groups',
    (action) => {
      expect(accessRoles.user.authorize({ group: [action] })).toMatchObject({
        success: false,
      })
    },
  )

  test('preserves Better Auth admin user permissions', () => {
    expect(accessRoles.admin.authorize({ user: ['get'] })).toEqual({
      success: true,
    })
    expect(accessRoles.admin.authorize({ user: ['list'] })).toEqual({
      success: true,
    })
    expect(accessRoles.admin.authorize({ user: ['set-role'] })).toEqual({
      success: true,
    })
  })

  test('preserves Better Auth admin session permissions', () => {
    expect(accessRoles.admin.authorize({ session: ['list'] })).toEqual({
      success: true,
    })
    expect(accessRoles.admin.authorize({ session: ['revoke'] })).toEqual({
      success: true,
    })
  })

  test('does not grant Better Auth management permissions to plain users', () => {
    expect(accessRoles.user.authorize({ user: ['get'] })).toMatchObject({
      success: false,
    })
    expect(accessRoles.user.authorize({ session: ['revoke'] })).toMatchObject({
      success: false,
    })
  })

  test('models only valid resource/action combinations', () => {
    const customPermission = {
      resource: 'group',
      action: 'update',
    } satisfies GlobalPermissionRequest

    const betterAuthUserPermission = {
      resource: 'user',
      action: 'get',
    } satisfies GlobalPermissionRequest

    const betterAuthSessionPermission = {
      resource: 'session',
      action: 'revoke',
    } satisfies GlobalPermissionRequest

    test('preserves Better Auth admin user permissions', () => {
      expect(accessRoles.admin.authorize({ user: ['get'] })).toEqual({
        success: true,
      })
    })

    test('preserves Better Auth admin session permissions', () => {
      expect(accessRoles.admin.authorize({ session: ['revoke'] })).toEqual({
        success: true,
      })
    })

    expect(customPermission).toEqual({ resource: 'group', action: 'update' })
    expect(betterAuthUserPermission).toEqual({ resource: 'user', action: 'get' })
    expect(betterAuthSessionPermission).toEqual({
      resource: 'session',
      action: 'revoke',
    })
  })
})

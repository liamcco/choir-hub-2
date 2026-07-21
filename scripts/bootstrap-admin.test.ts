import { describe, expect, mock, test } from 'bun:test'

const { bootstrapAdmin, normalizeAdminEmail, normalizeRoles, readAdminConfig } = await import('./bootstrap-admin')

describe('admin bootstrap helpers', () => {
  test('normalizes configured email for lookup and creation', () => {
    expect(normalizeAdminEmail('  ADMIN@Example.COM ')).toBe('admin@example.com')
  })

  test('normalizes roles without dropping existing roles or duplicating admin', () => {
    expect(normalizeRoles(' user, admin ,user, ')).toBe('user,admin')
    expect(normalizeRoles(null)).toBe('admin')
  })

  test('requires a password for new-user creation', () => {
    expect(() => readAdminConfig({ ADMIN_EMAIL: 'admin@example.com' })).toThrow(
      'ADMIN_EMAIL and ADMIN_PASSWORD are required.',
    )
    expect(() => readAdminConfig({ ADMIN_EMAIL: 'admin@example.com', ADMIN_PASSWORD: 'short' })).toThrow(
      'ADMIN_PASSWORD must be at least 8 characters.',
    )
  })

  test('creates a missing user with the configured values', async () => {
    const findUnique = mock(async () => null)
    const createUser = mock(async ({ body }: { body: { email: string } }) => ({ user: { email: body.email } }))
    const prisma = { user: { findUnique, update: mock() }, $disconnect: mock(async () => {}) }

    await expect(
      bootstrapAdmin(
        { prisma, auth: { api: { createUser } } },
        { email: 'admin@example.com', password: 'long-password', name: 'Choir Admin' },
      ),
    ).resolves.toMatchObject({ action: 'created', user: { email: 'admin@example.com' } })
    expect(createUser).toHaveBeenCalledWith({
      body: { email: 'admin@example.com', password: 'long-password', name: 'Choir Admin', role: 'admin' },
    })
  })

  test('promotes an existing user, preserving roles and password', async () => {
    const findUnique = mock(async () => ({ id: 'user-1', email: 'admin@example.com', role: ' user, editor,admin ' }))
    const update = mock(async ({ data }: { data: Record<string, unknown> }) => ({
      email: 'admin@example.com',
      ...data,
    }))
    const createUser = mock()
    const prisma = { user: { findUnique, update }, $disconnect: mock(async () => {}) }

    await bootstrapAdmin(
      { prisma, auth: { api: { createUser } } },
      { email: 'admin@example.com', password: 'unused-password', name: 'New Name' },
    )

    expect(findUnique).toHaveBeenCalledWith({ where: { email: 'admin@example.com' } })
    expect(update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { role: 'user,editor,admin', emailVerified: true },
    })
    expect(createUser).not.toHaveBeenCalled()
  })
})

import { beforeEach, describe, expect, mock, test } from 'bun:test'

const requestHeaders = new Headers({ cookie: 'session=abc' })
const headers = mock(async () => requestHeaders)
const createUser = mock(async () => ({ user: { id: 'user-1' } }))
const removeUser = mock(async () => undefined)
const signInMagicLink = mock(async () => undefined)
const updateMemberStatus = mock(async () => ({ id: 'user-1' }))
const startChoirMembership = mock(async () => ({ id: 'membership-1' }))
const startSectionPlacement = mock(async () => ({ id: 'placement-1' }))
const adminActionCompleted = mock(() => {})
const accountAccessChanged = mock(() => {})
const loggerError = mock(() => {})
const select = mock(() => createQuery([]))

mock.module('server-only', () => ({}))
mock.module('next/headers', () => ({ headers }))
mock.module('@/core/auth/auth', () => ({ auth: { api: { createUser, removeUser, signInMagicLink } } }))
mock.module('@/core/db', () => ({ db: { select } }))
mock.module('@/core/logging', () => ({
  audit: { adminActionCompleted, accountAccessChanged },
  logger: { error: loggerError },
}))
mock.module('@/features/organization/core/users', () => ({ users: { updateMemberStatus } }))
mock.module('@/features/organization/core/home-placement', () => ({
  homePlacement: { startChoirMembership, startSectionPlacement },
}))
mock.module('@/features/organization', () => ({ organizationService: { users: { updateMemberStatus } } }))

const { userOnboarding } = await import('./service')

beforeEach(() => {
  headers.mockClear()
  createUser.mockReset()
  createUser.mockResolvedValue({ user: { id: 'user-1' } })
  removeUser.mockReset()
  removeUser.mockResolvedValue(undefined)
  signInMagicLink.mockReset()
  signInMagicLink.mockResolvedValue(undefined)
  updateMemberStatus.mockReset()
  updateMemberStatus.mockResolvedValue({ id: 'user-1' })
  startChoirMembership.mockReset()
  startChoirMembership.mockResolvedValue({ id: 'membership-1' })
  startSectionPlacement.mockReset()
  startSectionPlacement.mockResolvedValue({ id: 'placement-1' })
  adminActionCompleted.mockClear()
  accountAccessChanged.mockClear()
  loggerError.mockClear()
  select.mockReset()
  select.mockImplementation(() => createQuery([]))
})

describe('User onboarding', () => {
  test('creates a User, applies status and placement through canonical writes, then sends activation link', async () => {
    const result = await userOnboarding.onboardBatch(
      [
        {
          row: 2,
          name: 'Liam Cotton',
          email: 'LIAM@example.com',
          status: 'ACTIVE',
          placement: { choirId: 'kk', sectionId: 'kk-b', voice: 'B1', label: 'KKB1' },
        },
      ],
      'admin-1',
    )

    expect(result.validationErrors).toEqual([])
    expect(result.outcomes).toEqual([
      {
        status: 'created',
        row: 2,
        id: 'user-1',
        name: 'Liam Cotton',
        email: 'liam@example.com',
        invitationSent: true,
      },
    ])
    expect(updateMemberStatus).toHaveBeenCalledWith('user-1', 'ACTIVE')
    expect(startChoirMembership).toHaveBeenCalledWith({ userId: 'user-1', choirId: 'kk' })
    expect(startSectionPlacement).toHaveBeenCalledWith({ userId: 'user-1', sectionId: 'kk-b', voice: 'B1' })
    expect(signInMagicLink).toHaveBeenCalledWith({
      headers: requestHeaders,
      body: { email: 'liam@example.com', callbackURL: '/activate', errorCallbackURL: '/activate' },
    })
    expect(adminActionCompleted).toHaveBeenCalledWith({
      actorUserId: 'admin-1',
      action: 'user.create',
      subject: { type: 'user', id: 'user-1' },
    })
  })

  test('keeps a created User when activation link delivery fails', async () => {
    signInMagicLink.mockRejectedValueOnce(new Error('SMTP unavailable'))

    const result = await userOnboarding.onboardBatch([plan()], 'admin-1')

    expect(result.outcomes[0]).toMatchObject({ status: 'created', invitationSent: false })
    expect(removeUser).not.toHaveBeenCalled()
    expect(loggerError).toHaveBeenCalledWith(
      'organization.user.onboarding.activation-link.failed',
      expect.objectContaining({ operation: 'initial', userId: 'user-1' }),
    )
  })

  test('compensates a row when relationship creation fails', async () => {
    startSectionPlacement.mockRejectedValueOnce(new Error('Placement is covered incorrectly.'))

    const result = await userOnboarding.onboardBatch(
      [
        {
          ...plan(),
          placement: { choirId: 'kk', sectionId: 'kk-b', voice: 'B1' },
        },
      ],
      'admin-1',
    )

    expect(result.outcomes[0]).toMatchObject({
      status: 'failed',
      cleanup: 'completed',
      message: 'Placement is covered incorrectly.',
    })
    expect(removeUser).toHaveBeenCalledWith({ headers: requestHeaders, body: { userId: 'user-1' } })
    expect(loggerError).toHaveBeenCalledWith(
      'organization.user.onboarding.failed',
      expect.objectContaining({ phase: 'create-section-placement', cleanup: 'completed' }),
    )
  })

  test('returns an explicit cleanup failure when the created User cannot be removed', async () => {
    startChoirMembership.mockRejectedValueOnce(new Error('Database unavailable'))
    removeUser.mockRejectedValueOnce(new Error('Auth unavailable'))

    const result = await userOnboarding.onboardBatch(
      [{ ...plan(), placement: { choirId: 'kk', sectionId: 'kk-b', voice: 'B1' } }],
      'admin-1',
    )

    expect(result.outcomes[0]).toMatchObject({ status: 'failed', cleanup: 'failed', userId: 'user-1' })
    expect(loggerError).toHaveBeenCalledWith(
      'organization.user.onboarding.cleanup.failed',
      expect.objectContaining({ userId: 'user-1' }),
    )
  })

  test('prevents creation when the email already exists', async () => {
    select.mockImplementationOnce(() => createQuery([{ email: 'ada@example.com' }]))

    const result = await userOnboarding.onboardBatch([{ ...plan(), email: 'ADA@example.com' }], 'admin-1')

    expect(result.validationErrors).toEqual([{ field: 'email', message: 'Email is already registered.' }])
    expect(createUser).not.toHaveBeenCalled()
  })

  test('resends an activation link for an unverified User', async () => {
    select.mockImplementationOnce(() => createQuery([{ email: 'ada@example.com', emailVerified: false }]))

    await expect(userOnboarding.resendActivationLink('user-1', 'admin-1')).resolves.toEqual({
      success: true,
      message: 'Activation link sent.',
    })
    expect(signInMagicLink).toHaveBeenCalledTimes(1)
    expect(adminActionCompleted).toHaveBeenCalledWith({
      actorUserId: 'admin-1',
      action: 'user.invitation.resend',
      subject: { type: 'user', id: 'user-1' },
    })
  })
})

function plan() {
  return { name: 'Ada Lovelace', email: 'ada@example.com', status: 'ACTIVE' as const, placement: null }
}

function createQuery(rows: unknown[]) {
  const fromResult = Promise.resolve(rows) as Promise<unknown[]> & {
    where: () => { limit: () => Promise<unknown[]> }
  }
  fromResult.where = () => ({ limit: async () => rows })
  return { from: () => fromResult }
}

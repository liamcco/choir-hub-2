import { randomBytes } from 'node:crypto'

import { createUserSchema, createUsersRequestSchema, createUsersResponseSchema, userSchema } from '@/api/models/user'
import { prisma } from '@/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import z from 'zod'

type User = z.infer<typeof userSchema>
type CreateUserInput = z.infer<typeof createUserSchema>
type CreateUsersInput = z.infer<typeof createUsersRequestSchema>
type CreateUsersResponse = z.infer<typeof createUsersResponseSchema>

export type CreateUserResult =
  | { status: 'created'; user: User }
  | { status: 'already-exists'; user: User }
  | { status: 'user-not-found' }

export async function getUserById(id: string): Promise<User | null> {
  const user = await auth.api.getUser({
    query: { id },
    headers: await headers(),
  })

  if (!user) {
    return null
  }

  return userSchema.parse(user)
}

export async function getUsers(): Promise<User[]> {
  const queryResult = await auth.api.listUsers({
    query: {},
    headers: await headers(),
  })

  return queryResult.users.map((user) => userSchema.parse(user))
}

export async function createUsers(input: CreateUsersInput): Promise<CreateUsersResponse> {
  const result: CreateUsersResponse = {
    succeeded: [],
    skipped: [],
    failed: [],
  }

  for (const userInput of input.users) {
    const createdUser = await createUser(userInput)

    if (createdUser.status === 'succeeded') {
      result.succeeded.push(createdUser.data)
    }

    if (createdUser.status === 'skipped') {
      result.skipped.push(createdUser.data)
    }

    if (createdUser.status === 'failed') {
      result.failed.push(createdUser.data)
    }
  }

  return result
}

async function createUser(
  input: CreateUserInput,
): Promise<
  | { status: 'succeeded'; data: CreateUsersResponse['succeeded'][number] }
  | { status: 'skipped'; data: CreateUsersResponse['skipped'][number] }
  | { status: 'failed'; data: CreateUsersResponse['failed'][number] }
> {
  const email = input.email.toLowerCase()
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingUser) {
    return {
      status: 'skipped',
      data: {
        name: input.name,
        email,
        message: 'User already exists',
      },
    }
  }

  const createdUser = await auth.api
    .createUser({
      body: {
        email,
        password: input.password ?? generateTemporaryPassword(),
        name: input.name,
        role: input.role,
      },
    })
    .catch((error: unknown) => nullifyExistingUserError(error, input.name, email))

  if ('status' in createdUser) {
    return createdUser
  }

  try {
    return {
      status: 'succeeded',
      data: {
        id: createdUser.user.id,
        name: createdUser.user.name,
        email: createdUser.user.email,
        emailVerified: createdUser.user.emailVerified,
        role: createdUser.user.role ?? 'user',
        createdAt: createdUser.user.createdAt,
        updatedAt: createdUser.user.updatedAt,
      },
    }
  } catch (error) {
    // TODO: consider rolling back the created user if user creation fails, depending on how likely that is to happen and whether it would cause issues

    return {
      status: 'failed',
      data: {
        name: input.name,
        email,
        message: getErrorMessage(error),
      },
    }
  }
}

function generateTemporaryPassword(): string {
  return `${randomBytes(18).toString('base64url')}aA1!`
}

/**
 * Nullifies errors from user creation that indicate the user already exists,
 * since this can happen due to race conditions and we want to treat it as
 * a skipped create rather than a failed create, while still surface
 * other types of errors as failures with their messages.
 * @param error
 * @param name
 * @param email
 * @returns
 */
function nullifyExistingUserError(
  error: unknown,
  name: string,
  email: string,
):
  | { status: 'skipped'; data: CreateUsersResponse['skipped'][number] }
  | { status: 'failed'; data: CreateUsersResponse['failed'][number] } {
  const message = getErrorMessage(error)

  if (message.toLowerCase().includes('user already exists')) {
    return {
      status: 'skipped',
      data: {
        name,
        email,
        message: 'User already exists',
      },
    }
  }

  return {
    status: 'failed',
    data: {
      name,
      email,
      message,
    },
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message
    }

    if ('body' in error && typeof error.body === 'object' && error.body && 'message' in error.body) {
      const bodyMessage = error.body.message

      if (typeof bodyMessage === 'string') {
        return bodyMessage
      }
    }
  }

  return 'Could not create user'
}

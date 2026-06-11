import { randomBytes } from 'node:crypto';

import {
  adminPersonSchema,
  provisionPeopleResponseSchema,
  provisionPeopleSchema,
  provisionPersonItemSchema,
} from '@/api/models/people';
import { personSchema } from '@/api/models/people';
import { prisma } from '@/db';
import { auth } from '@/lib/auth';
import z from 'zod';

type Person = z.infer<typeof personSchema>;
type AdminPerson = z.infer<typeof adminPersonSchema>;
type ProvisionPersonInput = z.infer<typeof provisionPersonItemSchema>;
type ProvisionPeopleInput = z.infer<typeof provisionPeopleSchema>;
type ProvisionPeopleResponse = z.infer<typeof provisionPeopleResponseSchema>;

export type CreatePersonResult =
  | { status: 'created'; person: Person }
  | { status: 'already-exists'; person: Person }
  | { status: 'user-not-found' };

export async function getPeople(): Promise<Person[]> {
  return await prisma.person.findMany({
    orderBy: {
      id: 'asc',
    },
  });
}

export async function getPersonById(id: string): Promise<Person | null> {
  return await prisma.person.findUnique({
    where: { id },
  });
}

export async function getAdminPeople(): Promise<AdminPerson[]> {
  const people = await prisma.person.findMany({
    orderBy: {
      id: 'asc',
    },
  });

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: people.map((person) => person.id),
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const usersById = new Map(users.map((user) => [user.id, user]));

  return people.map((person) => ({
    ...person,
    user: usersById.get(person.id) ?? null,
  }));
}

export async function provisionPeople(input: ProvisionPeopleInput): Promise<ProvisionPeopleResponse> {
  const result: ProvisionPeopleResponse = {
    succeeded: [],
    skipped: [],
    failed: [],
  };

  for (const personInput of input.people) {
    const provisionedPerson = await provisionPerson(personInput);

    if (provisionedPerson.status === 'succeeded') {
      result.succeeded.push(provisionedPerson.data);
    }

    if (provisionedPerson.status === 'skipped') {
      result.skipped.push(provisionedPerson.data);
    }

    if (provisionedPerson.status === 'failed') {
      result.failed.push(provisionedPerson.data);
    }
  }

  return result;
}

async function provisionPerson(
  input: ProvisionPersonInput,
): Promise<
  | { status: 'succeeded'; data: ProvisionPeopleResponse['succeeded'][number] }
  | { status: 'skipped'; data: ProvisionPeopleResponse['skipped'][number] }
  | { status: 'failed'; data: ProvisionPeopleResponse['failed'][number] }
> {
  const email = input.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      status: 'skipped',
      data: {
        name: input.name,
        email,
        message: 'User already exists',
      },
    };
  }

  const createdUser = await auth.api
    .createUser({
      body: {
        email,
        password: input.password ?? generateTemporaryPassword(),
        name: input.name,
        role: input.role ?? 'user',
      },
    })
    .catch((error: unknown) => nullifyExistingUserError(error, input.name, email));

  if ('status' in createdUser) {
    return createdUser;
  }

  try {
    const person = await prisma.person.create({
      data: {
        id: createdUser.user.id,
      },
    });

    return {
      status: 'succeeded',
      data: {
        person,
        user: {
          id: createdUser.user.id,
          name: createdUser.user.name,
          email: createdUser.user.email,
          emailVerified: createdUser.user.emailVerified,
          role: createdUser.user.role ?? null,
          createdAt: createdUser.user.createdAt,
          updatedAt: createdUser.user.updatedAt,
        },
      },
    };
  } catch (error) {
    await cleanupProvisionedUser(createdUser.user.id);

    return {
      status: 'failed',
      data: {
        name: input.name,
        email,
        message: getErrorMessage(error),
      },
    };
  }
}

export async function createPersonForUser(id: string): Promise<CreatePersonResult> {
  return await prisma.$transaction(async (tx) => {
    const existingPerson = await tx.person.findUnique({
      where: { id },
    });

    if (existingPerson) {
      return {
        status: 'already-exists',
        person: existingPerson,
      };
    }

    const user = await tx.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return {
        status: 'user-not-found',
      };
    }

    const person = await tx.person.create({
      data: { id },
    });

    return {
      status: 'created',
      person,
    };
  });
}

function generateTemporaryPassword(): string {
  return `${randomBytes(18).toString('base64url')}aA1!`;
}

function nullifyExistingUserError(
  error: unknown,
  name: string,
  email: string,
):
  | {
      user: {
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        role?: string | null;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  | { status: 'skipped'; data: ProvisionPeopleResponse['skipped'][number] }
  | { status: 'failed'; data: ProvisionPeopleResponse['failed'][number] } {
  const message = getErrorMessage(error);

  if (message.toLowerCase().includes('user already exists')) {
    return {
      status: 'skipped',
      data: {
        name,
        email,
        message: 'User already exists',
      },
    };
  }

  return {
    status: 'failed',
    data: {
      name,
      email,
      message,
    },
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }

    if ('body' in error && typeof error.body === 'object' && error.body && 'message' in error.body) {
      const bodyMessage = error.body.message;

      if (typeof bodyMessage === 'string') {
        return bodyMessage;
      }
    }
  }

  return 'Could not provision person';
}

async function cleanupProvisionedUser(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.session.deleteMany({
      where: { userId },
    }),
    prisma.account.deleteMany({
      where: { userId },
    }),
    prisma.twoFactor.deleteMany({
      where: { userId },
    }),
    prisma.passkey.deleteMany({
      where: { userId },
    }),
    prisma.user.deleteMany({
      where: { id: userId },
    }),
  ]);
}

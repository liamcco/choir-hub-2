import 'server-only'

import { prisma } from '@/core/db'
import {
  DuplicateEntityError,
  EntityDoesNotExistError,
  InvalidRelationshipError,
} from '@/features/organization/core/errors'
import type { GroupKind } from '@/prisma/generated/client'

export const groups = {
  list() {
    return prisma.group.findMany({
      orderBy: [{ parentGroupId: 'asc' }, { name: 'asc' }],
    })
  },

  async create(input: { kind: GroupKind; name: string; description?: string | null; parentGroupId?: string | null }) {
    const group = normalizeGroup(input)
    await assertParentGroupExists(group.parentGroupId)
    await assertSiblingGroupNameIsUnique(group)
    return prisma.group.create({ data: group })
  },

  async update(
    groupId: string,
    input: { kind: GroupKind; name: string; description?: string | null; parentGroupId?: string | null },
  ) {
    const group = normalizeGroup(input)
    await assertGroupExists(groupId)
    await assertParentGroupExists(group.parentGroupId)
    await assertValidGroupParent(groupId, group.parentGroupId)
    await assertSiblingGroupNameIsUnique(group, groupId)
    return prisma.group.update({ where: { id: groupId }, data: group })
  },
}

async function assertGroupExists(groupId: string) {
  const group = await prisma.group.findUnique({ where: { id: groupId }, select: { id: true } })
  if (!group) {
    throw new EntityDoesNotExistError('Choose an existing Group.')
  }
}

async function assertParentGroupExists(parentGroupId: string | null) {
  if (!parentGroupId) return
  const parent = await prisma.group.findUnique({ where: { id: parentGroupId }, select: { id: true } })
  if (!parent) {
    throw new EntityDoesNotExistError('Choose an existing parent Group.', { field: 'parentGroupId' })
  }
}

async function assertSiblingGroupNameIsUnique(
  input: { name: string; parentGroupId: string | null },
  excludingGroupId?: string,
) {
  const siblings = await prisma.group.findMany({ where: { parentGroupId: input.parentGroupId } })
  const duplicate = siblings.find(
    (group) => group.id !== excludingGroupId && normalizeName(group.name) === normalizeName(input.name),
  )
  if (duplicate) {
    throw new DuplicateEntityError(`A sibling Group named "${input.name}" already exists.`, { field: 'name' })
  }
}

async function assertValidGroupParent(groupId: string, parentGroupId: string | null) {
  if (!parentGroupId) return
  if (parentGroupId === groupId) {
    throw new InvalidRelationshipError('A Group cannot be its own parent.', {
      field: 'parentGroupId',
    })
  }

  const allGroups = await groups.list()
  const groupsById = new Map(allGroups.map((group) => [group.id, group]))
  let candidate = groupsById.get(parentGroupId)
  while (candidate) {
    if (candidate.id === groupId) {
      throw new InvalidRelationshipError('A Group cannot be moved under one of its child Groups.', {
        field: 'parentGroupId',
      })
    }
    candidate = candidate.parentGroupId ? groupsById.get(candidate.parentGroupId) : undefined
  }
}

function normalizeGroup(input: {
  kind: GroupKind
  name: string
  description?: string | null
  parentGroupId?: string | null
}) {
  return {
    kind: input.kind,
    name: input.name.trim(),
    description: normalizeOptionalString(input.description),
    parentGroupId: input.parentGroupId || null,
  }
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase()
}

function normalizeOptionalString(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized || null
}

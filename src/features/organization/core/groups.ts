import 'server-only'

import { database } from '@/core/db'
import type { GroupKind } from '@/drizzle/schema'
import {
  DuplicateEntityError,
  EntityDoesNotExistError,
  InvalidRelationshipError,
} from '@/features/organization/core/errors'
import { groupSiblingNamesMatch, isGroupAncestor } from '@/features/organization/core/group-tree'
import { normalizeOptionalString } from '@/shared/formatting'

export const groups = {
  list() {
    return database.group.findMany({
      orderBy: [{ parentGroupId: 'asc' }, { name: 'asc' }],
    })
  },

  get(groupId: string) {
    return database.group.findUnique({ where: { id: groupId } })
  },

  async create(input: { kind: GroupKind; name: string; description?: string | null; parentGroupId?: string | null }) {
    const group = normalizeGroup(input)
    await assertParentGroupExists(group.parentGroupId)
    await assertSiblingGroupNameIsUnique(group)
    return database.group.create({ data: group })
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
    return database.group.update({ where: { id: groupId }, data: group })
  },
}

async function assertGroupExists(groupId: string) {
  const group = await database.group.findUnique({ where: { id: groupId }, select: { id: true } })
  if (!group) {
    throw new EntityDoesNotExistError('Choose an existing Group.')
  }
}

async function assertParentGroupExists(parentGroupId: string | null) {
  if (!parentGroupId) return
  const parent = await database.group.findUnique({ where: { id: parentGroupId }, select: { id: true } })
  if (!parent) {
    throw new EntityDoesNotExistError('Choose an existing parent Group.', { field: 'parentGroupId' })
  }
}

async function assertSiblingGroupNameIsUnique(
  input: { name: string; parentGroupId: string | null },
  excludingGroupId?: string,
) {
  const siblings = await database.group.findMany({ where: { parentGroupId: input.parentGroupId } })
  const duplicate = siblings.find(
    (group) => group.id !== excludingGroupId && groupSiblingNamesMatch(group.name, input.name),
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
  if (isGroupAncestor(allGroups, { groupId: parentGroupId, ancestorGroupId: groupId })) {
    throw new InvalidRelationshipError('A Group cannot be moved under one of its child Groups.', {
      field: 'parentGroupId',
    })
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

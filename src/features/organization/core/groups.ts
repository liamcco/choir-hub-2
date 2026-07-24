import 'server-only'

import { asc, eq, isNull } from 'drizzle-orm'
import { db } from '@/core/db'
import { type GroupKind, group as groupTable } from '@/drizzle/schema'
import {
  DuplicateEntityError,
  EntityDoesNotExistError,
  InvalidRelationshipError,
} from '@/features/organization/core/errors'
import { groupSiblingNamesMatch, isGroupAncestor } from '@/features/organization/core/group-tree'
import { normalizeOptionalString } from '@/shared/formatting'

export const groups = {
  list() {
    return db
      .select()
      .from(groupTable)
      .orderBy(asc(groupTable.parentGroupId), asc(groupTable.name))
      .then((rows) => rows.map(toDomainGroup))
  },

  get(groupId: string) {
    return db
      .select()
      .from(groupTable)
      .where(eq(groupTable.id, groupId))
      .limit(1)
      .then((rows) => (rows[0] ? toDomainGroup(rows[0]) : null))
  },

  async create(input: { kind: GroupKind; name: string; description?: string | null; parentGroupId?: string | null }) {
    const group = normalizeGroup(input)
    await assertParentGroupExists(group.parentGroupId)
    await assertSiblingGroupNameIsUnique(group)
    return db
      .insert(groupTable)
      .values({ ...group, kind: group.kind.toLowerCase() as never })
      .returning()
      .then((rows) => toDomainGroup(rows[0]))
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
    return db
      .update(groupTable)
      .set({ ...group, kind: group.kind.toLowerCase() as never, updatedAt: new Date() })
      .where(eq(groupTable.id, groupId))
      .returning()
      .then((rows) => toDomainGroup(rows[0]))
  },
}

async function assertGroupExists(groupId: string) {
  const [group] = await db.select({ id: groupTable.id }).from(groupTable).where(eq(groupTable.id, groupId)).limit(1)
  if (!group) {
    throw new EntityDoesNotExistError('Choose an existing Group.')
  }
}

async function assertParentGroupExists(parentGroupId: string | null) {
  if (!parentGroupId) return
  const [parent] = await db
    .select({ id: groupTable.id })
    .from(groupTable)
    .where(eq(groupTable.id, parentGroupId))
    .limit(1)
  if (!parent) {
    throw new EntityDoesNotExistError('Choose an existing parent Group.', { field: 'parentGroupId' })
  }
}

async function assertSiblingGroupNameIsUnique(
  input: { name: string; parentGroupId: string | null },
  excludingGroupId?: string,
) {
  const siblings = await db
    .select()
    .from(groupTable)
    .where(
      input.parentGroupId === null
        ? isNull(groupTable.parentGroupId)
        : eq(groupTable.parentGroupId, input.parentGroupId),
    )
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

function toDomainGroup(row: typeof groupTable.$inferSelect) {
  return { ...row, kind: row.kind.toUpperCase() as GroupKind }
}

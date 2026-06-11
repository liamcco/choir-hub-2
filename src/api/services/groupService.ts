import { z } from 'zod'

import {
  assignPositionHolderSchema,
  createGroupKindSchema,
  createGroupSchema,
  createMembershipSchema,
  createPositionSchema,
  updateGroupKindSchema,
  updateGroupSchema,
  updatePositionSchema,
} from '@/api/models/groups'
import { prisma } from '@/db'

export class GroupServiceError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 404 | 409 = 400,
  ) {
    super(message)
  }
}

type CreateGroupKindInput = z.infer<typeof createGroupKindSchema>
type UpdateGroupKindInput = z.infer<typeof updateGroupKindSchema>
type CreateGroupInput = z.infer<typeof createGroupSchema>
type UpdateGroupInput = z.infer<typeof updateGroupSchema>
type CreateMembershipInput = z.infer<typeof createMembershipSchema>
type CreatePositionInput = z.infer<typeof createPositionSchema>
type UpdatePositionInput = z.infer<typeof updatePositionSchema>
type AssignPositionHolderInput = z.infer<typeof assignPositionHolderSchema>

export async function getGroupKinds() {
  return await prisma.groupKind.findMany({
    orderBy: {
      name: 'asc',
    },
  })
}

export async function getGroupKindById(id: string) {
  return await prisma.groupKind.findUnique({
    where: { id },
  })
}

export async function createGroupKind(input: CreateGroupKindInput) {
  await assertUniqueGroupKindName(input.name)

  return await prisma.groupKind.create({
    data: input,
  })
}

export async function updateGroupKind(id: string, input: UpdateGroupKindInput) {
  const groupKind = await getGroupKindById(id)

  if (!groupKind) {
    throw new GroupServiceError('Group kind not found', 404)
  }

  if (input.name && input.name !== groupKind.name) {
    await assertUniqueGroupKindName(input.name)
  }

  return await prisma.groupKind.update({
    where: { id },
    data: input,
  })
}

export async function deleteGroupKind(id: string) {
  const groupKind = await prisma.groupKind.findUnique({
    where: { id },
    select: {
      id: true,
      groups: {
        select: { id: true },
      },
    },
  })

  if (!groupKind) {
    throw new GroupServiceError('Group kind not found', 404)
  }

  if (groupKind.groups.length > 0) {
    throw new GroupServiceError('A group kind used by groups cannot be deleted', 409)
  }

  await prisma.groupKind.delete({
    where: { id },
  })
}

export async function getGroups() {
  return await prisma.group.findMany({
    include: {
      kind: true,
    },
    orderBy: [{ parentGroupId: 'asc' }, { name: 'asc' }],
  })
}

export async function getGroupById(id: string) {
  return await prisma.group.findUnique({
    where: { id },
    include: {
      kind: true,
    },
  })
}

export async function createGroup(input: CreateGroupInput) {
  const parentGroupId = input.parentGroupId ?? null

  await assertGroupKindExists(input.kindId)
  await assertParentGroupExists(parentGroupId)
  await assertUniqueGroupName(input.name, parentGroupId)

  return await prisma.group.create({
    data: {
      kindId: input.kindId,
      name: input.name,
      description: input.description,
      active: input.active,
      isContainer: input.isContainer,
      parentGroupId,
    },
    include: {
      kind: true,
    },
  })
}

export async function updateGroup(id: string, input: UpdateGroupInput) {
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      memberships: {
        select: { id: true },
      },
    },
  })

  if (!group) {
    throw new GroupServiceError('Group not found', 404)
  }

  const parentGroupId = Object.hasOwn(input, 'parentGroupId') ? (input.parentGroupId ?? null) : group.parentGroupId
  const name = input.name ?? group.name

  if (input.kindId) {
    await assertGroupKindExists(input.kindId)
  }

  await assertParentGroupExists(parentGroupId)
  await assertGroupParentDoesNotCreateCycle(id, parentGroupId)

  if (name !== group.name || parentGroupId !== group.parentGroupId) {
    await assertUniqueGroupName(name, parentGroupId, id)
  }

  if (input.isContainer === true && group.memberships.length > 0) {
    throw new GroupServiceError('A group with direct memberships cannot be converted to a container group', 409)
  }

  return await prisma.group.update({
    where: { id },
    data: {
      kindId: input.kindId,
      name: input.name,
      description: input.description,
      active: input.active,
      isContainer: input.isContainer,
      parentGroupId,
    },
    include: {
      kind: true,
    },
  })
}

export async function deleteGroup(id: string) {
  const group = await prisma.group.findUnique({
    where: { id },
    select: {
      id: true,
      childGroups: {
        select: { id: true },
      },
    },
  })

  if (!group) {
    throw new GroupServiceError('Group not found', 404)
  }

  if (group.childGroups.length > 0) {
    throw new GroupServiceError('A group with child groups cannot be deleted', 409)
  }

  await prisma.group.delete({
    where: { id },
  })
}

export async function getDirectGroupMemberships(groupId: string) {
  await assertGroupExists(groupId)

  return await prisma.personGroupMembership.findMany({
    where: { groupId },
    orderBy: {
      addedAt: 'asc',
    },
  })
}

export async function createGroupMembership(groupId: string, input: CreateMembershipInput) {
  const [group, person] = await Promise.all([
    prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        isContainer: true,
      },
    }),
    prisma.person.findUnique({
      where: { id: input.personId },
      select: { id: true },
    }),
  ])

  if (!group) {
    throw new GroupServiceError('Group not found', 404)
  }

  if (group.isContainer) {
    throw new GroupServiceError('Direct memberships cannot be added to container groups', 409)
  }

  if (!person) {
    throw new GroupServiceError('Person not found', 404)
  }

  const existingMembership = await prisma.personGroupMembership.findUnique({
    where: {
      personId_groupId: {
        personId: input.personId,
        groupId,
      },
    },
  })

  if (existingMembership) {
    throw new GroupServiceError('Person is already a direct member of this group', 409)
  }

  return await prisma.personGroupMembership.create({
    data: {
      personId: input.personId,
      groupId,
    },
  })
}

export async function deleteGroupMembership(groupId: string, membershipId: string) {
  const membership = await prisma.personGroupMembership.findUnique({
    where: { id: membershipId },
  })

  if (!membership || membership.groupId !== groupId) {
    throw new GroupServiceError('Membership not found', 404)
  }

  await prisma.$transaction([
    prisma.position.updateMany({
      where: {
        personGroupMembershipId: membershipId,
      },
      data: {
        personGroupMembershipId: null,
        heldSince: null,
      },
    }),
    prisma.personGroupMembership.delete({
      where: { id: membershipId },
    }),
  ])
}

export async function getEffectiveGroupMembers(groupId: string) {
  await assertGroupExists(groupId)

  const descendantGroupIds = await getDescendantGroupIds(groupId)
  const effectiveGroupIds = [groupId, ...descendantGroupIds]
  const memberships = await prisma.personGroupMembership.findMany({
    where: {
      groupId: {
        in: effectiveGroupIds,
      },
    },
    orderBy: [{ personId: 'asc' }, { groupId: 'asc' }],
  })

  const membersByPersonId = new Map<string, { personId: string; directGroupIds: string[] }>()

  for (const membership of memberships) {
    const existing = membersByPersonId.get(membership.personId)

    if (existing) {
      existing.directGroupIds.push(membership.groupId)
      continue
    }

    membersByPersonId.set(membership.personId, {
      personId: membership.personId,
      directGroupIds: [membership.groupId],
    })
  }

  return [...membersByPersonId.values()]
}

export async function getGroupPositions(groupId: string) {
  await assertGroupExists(groupId)

  return await prisma.position.findMany({
    where: { groupId },
    orderBy: {
      name: 'asc',
    },
  })
}

export async function getPositionById(id: string) {
  return await prisma.position.findUnique({
    where: { id },
  })
}

export async function createGroupPosition(groupId: string, input: CreatePositionInput) {
  await assertGroupExists(groupId)
  await assertUniquePositionName(groupId, input.name)

  if (input.personGroupMembershipId) {
    await assertMembershipBelongsToGroup(input.personGroupMembershipId, groupId)
  }

  if (!input.personGroupMembershipId && input.heldSince) {
    throw new GroupServiceError('A vacant position cannot have heldSince set')
  }

  return await prisma.position.create({
    data: {
      groupId,
      name: input.name,
      description: input.description,
      personGroupMembershipId: input.personGroupMembershipId,
      heldSince: input.personGroupMembershipId ? (input.heldSince ?? new Date()) : null,
    },
  })
}

export async function updatePosition(id: string, input: UpdatePositionInput) {
  const position = await getExistingPosition(id)
  const nextName = input.name ?? position.name

  if (nextName !== position.name) {
    await assertUniquePositionName(position.groupId, nextName, id)
  }

  const isHolderUpdate = Object.hasOwn(input, 'personGroupMembershipId')
  const personGroupMembershipId = isHolderUpdate ? (input.personGroupMembershipId ?? null) : position.personGroupMembershipId

  if (personGroupMembershipId) {
    await assertMembershipBelongsToGroup(personGroupMembershipId, position.groupId)
  }

  if (!personGroupMembershipId && input.heldSince) {
    throw new GroupServiceError('A vacant position cannot have heldSince set')
  }

  if (!personGroupMembershipId && Object.hasOwn(input, 'heldSince') && input.heldSince === null) {
    return await prisma.position.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        personGroupMembershipId: null,
        heldSince: null,
      },
    })
  }

  return await prisma.position.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      personGroupMembershipId: isHolderUpdate ? personGroupMembershipId : undefined,
      heldSince: personGroupMembershipId
        ? Object.hasOwn(input, 'heldSince')
          ? input.heldSince
          : isHolderUpdate
            ? new Date()
            : undefined
        : isHolderUpdate
          ? null
          : undefined,
    },
  })
}

export async function assignPositionHolder(id: string, input: AssignPositionHolderInput) {
  const position = await getExistingPosition(id)

  await assertMembershipBelongsToGroup(input.personGroupMembershipId, position.groupId)

  return await prisma.position.update({
    where: { id },
    data: {
      personGroupMembershipId: input.personGroupMembershipId,
      heldSince: input.heldSince ?? new Date(),
    },
  })
}

export async function vacatePosition(id: string) {
  await getExistingPosition(id)

  return await prisma.position.update({
    where: { id },
    data: {
      personGroupMembershipId: null,
      heldSince: null,
    },
  })
}

export async function deletePosition(id: string) {
  await getExistingPosition(id)

  await prisma.position.delete({
    where: { id },
  })
}

async function assertGroupKindExists(id: string) {
  const groupKind = await prisma.groupKind.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!groupKind) {
    throw new GroupServiceError('Group kind not found', 404)
  }
}

async function assertGroupExists(id: string) {
  const group = await prisma.group.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!group) {
    throw new GroupServiceError('Group not found', 404)
  }
}

async function assertParentGroupExists(parentGroupId: string | null) {
  if (!parentGroupId) {
    return
  }

  await assertGroupExists(parentGroupId)
}

async function assertUniqueGroupKindName(name: string) {
  const existingGroupKind = await prisma.groupKind.findUnique({
    where: { name },
    select: { id: true },
  })

  if (existingGroupKind) {
    throw new GroupServiceError('Group kind name already exists', 409)
  }
}

async function assertUniqueGroupName(name: string, parentGroupId: string | null, ignoreGroupId?: string) {
  const existingGroup = await prisma.group.findFirst({
    where: {
      name,
      parentGroupId,
      id: ignoreGroupId ? { not: ignoreGroupId } : undefined,
    },
    select: { id: true },
  })

  if (existingGroup) {
    throw new GroupServiceError('Group name already exists under this parent', 409)
  }
}

async function assertUniquePositionName(groupId: string, name: string, ignorePositionId?: string) {
  const existingPosition = await prisma.position.findFirst({
    where: {
      groupId,
      name,
      id: ignorePositionId ? { not: ignorePositionId } : undefined,
    },
    select: { id: true },
  })

  if (existingPosition) {
    throw new GroupServiceError('Position name already exists in this group', 409)
  }
}

async function assertGroupParentDoesNotCreateCycle(groupId: string, parentGroupId: string | null) {
  if (!parentGroupId) {
    return
  }

  if (groupId === parentGroupId) {
    throw new GroupServiceError('A group cannot be its own parent', 409)
  }

  let currentParentId: string | null = parentGroupId

  while (currentParentId) {
    if (currentParentId === groupId) {
      throw new GroupServiceError('Group hierarchy cannot contain cycles', 409)
    }

    const parent: { parentGroupId: string | null } | null = await prisma.group.findUnique({
      where: { id: currentParentId },
      select: { parentGroupId: true },
    })

    currentParentId = parent?.parentGroupId ?? null
  }
}

async function assertMembershipBelongsToGroup(membershipId: string, groupId: string) {
  const membership = await prisma.personGroupMembership.findUnique({
    where: { id: membershipId },
    select: { groupId: true },
  })

  if (!membership) {
    throw new GroupServiceError('Membership not found', 404)
  }

  if (membership.groupId !== groupId) {
    throw new GroupServiceError('Position holder must be a direct member of the position group', 409)
  }
}

async function getExistingPosition(id: string) {
  const position = await prisma.position.findUnique({
    where: { id },
  })

  if (!position) {
    throw new GroupServiceError('Position not found', 404)
  }

  return position
}

async function getDescendantGroupIds(groupId: string) {
  const descendants: string[] = []
  const queue = [groupId]

  while (queue.length > 0) {
    const currentGroupId = queue.shift()

    if (!currentGroupId) {
      continue
    }

    const children = await prisma.group.findMany({
      where: {
        parentGroupId: currentGroupId,
      },
      select: {
        id: true,
      },
    })

    for (const child of children) {
      descendants.push(child.id)
      queue.push(child.id)
    }
  }

  return descendants
}

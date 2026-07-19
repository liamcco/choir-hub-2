import type { AccessActor } from '@/lib/access-actor'
import { canAccessAdminSurface } from '@/lib/route-access'
import { type GroupStructure, OrganizationDomainError, type OrganizationRecord } from '@/organization'
import type { CreateGroupInput, UpdateGroupInput } from '@/organization/types'

export type GroupManagementActor = AccessActor

export type GroupHierarchyNode = {
  group: OrganizationRecord<'group'>
  depth: number
  children: GroupHierarchyNode[]
}

export type GroupManagementState = {
  groups: OrganizationRecord<'group'>[]
  hierarchy: GroupHierarchyNode[]
}

export type GroupManagementService = {
  listGroupManagement(actor: GroupManagementActor): Promise<GroupManagementState>
  createGroup(actor: GroupManagementActor, input: CreateGroupInput): Promise<OrganizationRecord<'group'>>
  updateGroup(
    actor: GroupManagementActor,
    groupId: string,
    input: UpdateGroupInput,
  ): Promise<OrganizationRecord<'group'>>
}

export class GroupManagementAuthorizationError extends Error {
  constructor() {
    super('Only admins can manage Groups.')
    this.name = 'GroupManagementAuthorizationError'
  }
}

export class GroupManagementValidationError extends Error {
  readonly fieldErrors: Partial<Record<keyof CreateGroupInput, string>>

  constructor(message: string, fieldErrors: Partial<Record<keyof CreateGroupInput, string>>) {
    super(message)
    this.name = 'GroupManagementValidationError'
    this.fieldErrors = fieldErrors
  }
}

export function createGroupManagementService({
  groupStructure,
}: {
  groupStructure: GroupStructure
}): GroupManagementService {
  return {
    async listGroupManagement(actor) {
      assertAdmin(actor)
      const groups = await groupStructure.listGroups()
      return {
        groups,
        hierarchy: buildGroupHierarchy(groups),
      }
    },
    async createGroup(actor, input) {
      assertAdmin(actor)
      return mapValidationErrors(() => groupStructure.createGroup(input))
    },
    async updateGroup(actor, groupId, input) {
      assertAdmin(actor)
      if (input.parentGroupId === groupId) {
        throw new GroupManagementValidationError('A Group cannot be its own parent.', {
          parentGroupId: 'A Group cannot be its own parent.',
        })
      }
      if (input.parentGroupId) {
        await assertParentIsNotDescendant(groupStructure, groupId, input.parentGroupId)
      }
      return mapValidationErrors(() => groupStructure.updateGroup(groupId, input))
    },
  }
}

export function buildGroupHierarchy(groups: OrganizationRecord<'group'>[]): GroupHierarchyNode[] {
  const nodes = new Map<string, GroupHierarchyNode>()
  const roots: GroupHierarchyNode[] = []

  for (const group of groups) {
    nodes.set(group.id, { group, depth: 0, children: [] })
  }

  for (const group of groups) {
    const node = nodes.get(group.id)
    if (!node) {
      continue
    }

    const parent = group.parentGroupId ? nodes.get(group.parentGroupId) : undefined
    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  assignDepths(roots, 0)
  sortHierarchy(roots)
  return roots
}

function assignDepths(nodes: GroupHierarchyNode[], depth: number) {
  for (const node of nodes) {
    node.depth = depth
    assignDepths(node.children, depth + 1)
  }
}

function sortHierarchy(nodes: GroupHierarchyNode[]) {
  nodes.sort(compareHierarchyNodes)
  for (const node of nodes) {
    sortHierarchy(node.children)
  }
}

function compareHierarchyNodes(first: GroupHierarchyNode, second: GroupHierarchyNode) {
  return first.group.name.localeCompare(second.group.name) || first.group.id.localeCompare(second.group.id)
}

async function mapValidationErrors<T>(operation: () => Promise<T>) {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof OrganizationDomainError) {
      throw new GroupManagementValidationError(error.message, {
        [error.field ?? 'name']: error.message,
      })
    }
    throw error
  }
}

async function assertParentIsNotDescendant(
  groupStructure: GroupStructure,
  groupId: string,
  candidateParentGroupId: string,
) {
  const groups = await groupStructure.listGroups()
  const childIdsByParentId = new Map<string, string[]>()

  for (const group of groups) {
    if (!group.parentGroupId) {
      continue
    }

    childIdsByParentId.set(group.parentGroupId, [...(childIdsByParentId.get(group.parentGroupId) ?? []), group.id])
  }

  const pending = [...(childIdsByParentId.get(groupId) ?? [])]
  while (pending.length) {
    const childId = pending.shift()
    if (!childId) {
      continue
    }
    if (childId === candidateParentGroupId) {
      throw new GroupManagementValidationError('A Group cannot be moved under one of its child Groups.', {
        parentGroupId: 'A Group cannot be moved under one of its child Groups.',
      })
    }
    pending.push(...(childIdsByParentId.get(childId) ?? []))
  }
}

function assertAdmin(actor: GroupManagementActor | null | undefined) {
  if (!canAccessAdminSurface(actor)) {
    throw new GroupManagementAuthorizationError()
  }
}

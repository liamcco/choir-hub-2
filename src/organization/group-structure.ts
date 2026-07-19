import { OrganizationDomainError } from '@/organization/errors'
import type {
  CreateGroupInput,
  OrganizationPersistence,
  OrganizationRecord,
  UpdateGroupInput,
} from '@/organization/types'

export type GroupStructure = {
  listGroups(): Promise<OrganizationRecord<'group'>[]>
  createGroup(input: CreateGroupInput): Promise<OrganizationRecord<'group'>>
  updateGroup(id: string, input: UpdateGroupInput): Promise<OrganizationRecord<'group'>>
}

export function createGroupStructure(persistence: OrganizationPersistence): GroupStructure {
  return {
    listGroups: () => persistence.listGroups(),
    createGroup: async (input) => {
      const prepared = prepareGroupInput(input)
      await assertSiblingGroupNameIsUnique(persistence, prepared)
      return persistence.createGroup(prepared)
    },
    updateGroup: async (id, input) => {
      const current = (await persistence.listGroups()).find((group) => group.id === id)
      if (!current) {
        return persistence.updateGroup(id, input)
      }
      const next = prepareGroupInput({
        kind: input.kind ?? current.kind,
        name: input.name ?? current.name,
        description: 'description' in input ? input.description : current.description,
        parentGroupId: 'parentGroupId' in input ? input.parentGroupId : current.parentGroupId,
      })
      await assertSiblingGroupNameIsUnique(persistence, next, id)
      return persistence.updateGroup(id, toUpdateGroupInput(input))
    },
  }
}

async function assertSiblingGroupNameIsUnique(
  persistence: OrganizationPersistence,
  input: Required<CreateGroupInput>,
  excludingGroupId?: string,
) {
  const duplicate = (await persistence.listGroups()).find(
    (group) =>
      group.id !== excludingGroupId &&
      group.parentGroupId === input.parentGroupId &&
      normalizeGroupName(group.name) === normalizeGroupName(input.name),
  )

  if (duplicate) {
    throw new OrganizationDomainError(
      'DUPLICATE_SIBLING_GROUP_NAME',
      `A sibling Group named "${input.name}" already exists.`,
      { field: 'name' },
    )
  }
}

function prepareGroupInput(input: CreateGroupInput): Required<CreateGroupInput> {
  return {
    kind: input.kind,
    name: input.name.trim(),
    description: normalizeOptionalString(input.description),
    parentGroupId: input.parentGroupId ?? null,
  }
}

function toUpdateGroupInput(input: UpdateGroupInput): UpdateGroupInput {
  return withoutUndefinedValues({
    ...input,
    name: input.name?.trim(),
    description: 'description' in input ? normalizeOptionalString(input.description) : undefined,
    parentGroupId: 'parentGroupId' in input ? (input.parentGroupId ?? null) : undefined,
  })
}

function normalizeGroupName(name: string) {
  return name.trim().toLocaleLowerCase()
}

function normalizeOptionalString(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function withoutUndefinedValues<T extends object>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T
}

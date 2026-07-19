import type {
  CreatePositionInput,
  CreatePositionScopeInput,
  DeletePositionScopeInput,
  OrganizationPersistence,
  OrganizationRecord,
  UpdatePositionInput,
} from '@/organization/types'

export type PositionScopeRegistry = {
  listPositions(): Promise<OrganizationRecord<'position'>[]>
  createPosition(input: CreatePositionInput): Promise<OrganizationRecord<'position'>>
  updatePosition(id: string, input: UpdatePositionInput): Promise<OrganizationRecord<'position'>>
  listPositionScopes(): Promise<OrganizationRecord<'positionScope'>[]>
  createPositionScope(input: CreatePositionScopeInput): Promise<OrganizationRecord<'positionScope'>>
  deletePositionScope(input: DeletePositionScopeInput): Promise<void>
}

export function createPositionScopeRegistry(persistence: OrganizationPersistence): PositionScopeRegistry {
  return {
    listPositions: () => persistence.listPositions(),
    createPosition: (input) => persistence.createPosition(preparePositionInput(input)),
    updatePosition: (id, input) => persistence.updatePosition(id, toUpdatePositionInput(input)),
    listPositionScopes: () => persistence.listPositionScopes(),
    createPositionScope: (input) => persistence.createPositionScope(input),
    deletePositionScope: (input) => persistence.deletePositionScope(input),
  }
}

function preparePositionInput(input: CreatePositionInput): Required<CreatePositionInput> {
  return {
    name: input.name.trim(),
    description: normalizeOptionalString(input.description),
  }
}

function toUpdatePositionInput(input: UpdatePositionInput): UpdatePositionInput {
  return withoutUndefinedValues({
    ...input,
    name: input.name?.trim(),
    description: 'description' in input ? normalizeOptionalString(input.description) : undefined,
  })
}

function normalizeOptionalString(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function withoutUndefinedValues<T extends object>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T
}

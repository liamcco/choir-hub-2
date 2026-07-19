export type OrganizationDomainErrorCode =
  | 'DUPLICATE_SIBLING_GROUP_NAME'
  | 'GROUP_MEMBERSHIP_PERIOD_OVERLAP'
  | 'POSITION_ASSIGNMENT_PERIOD_OVERLAP'
  | 'INVALID_PERIOD'

export class OrganizationDomainError extends Error {
  readonly code: OrganizationDomainErrorCode
  readonly field?: string

  constructor(code: OrganizationDomainErrorCode, message: string, options: { field?: string } = {}) {
    super(message)
    this.name = 'OrganizationDomainError'
    this.code = code
    this.field = options.field
  }
}

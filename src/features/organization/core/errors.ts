import { FormError } from '@/shared/forms/errors'

export class OrganizationOperationError extends FormError {
  readonly field?: string

  constructor(message: string, options: { field?: string } = {}) {
    super(message, options)
    this.name = 'OrganizationOperationError'
    this.field = options.field
  }
}

export class EntityDoesNotExistError extends OrganizationOperationError {
  constructor(message: string, options: { field?: string } = {}) {
    super(message, options)
    this.name = 'EntityDoesNotExistError'
  }
}

export class DuplicateEntityError extends OrganizationOperationError {
  constructor(message: string, options: { field?: string } = {}) {
    super(message, options)
    this.name = 'DuplicateEntityError'
  }
}

export class InvalidRelationshipError extends OrganizationOperationError {
  constructor(message: string, options: { field?: string } = {}) {
    super(message, options)
    this.name = 'InvalidRelationshipError'
  }
}

export class DateOverlapError extends OrganizationOperationError {
  constructor(message: string, options: { field?: string } = {}) {
    super(message, options)
    this.name = 'DateOverlapError'
  }
}

export class InvalidDatePeriodError extends OrganizationOperationError {
  constructor(message: string, options: { field?: string } = {}) {
    super(message, options)
    this.name = 'InvalidDatePeriodError'
  }
}

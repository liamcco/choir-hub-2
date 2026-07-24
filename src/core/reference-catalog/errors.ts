import { FormError } from '@/shared/forms/errors'

export class DuplicateEntityError extends FormError {
  constructor(message: string, options: { field?: string } = {}) {
    super(message, options)
    this.name = 'DuplicateEntityError'
  }
}

export class InvalidRelationshipError extends FormError {
  constructor(message: string, options: { field?: string } = {}) {
    super(message, options)
    this.name = 'InvalidRelationshipError'
  }
}

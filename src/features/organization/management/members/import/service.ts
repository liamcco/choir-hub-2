import 'server-only'

import { type UserOnboardingPlan, userOnboarding } from '../onboarding'
import { type ImportedUser, parseUserImportCsv } from './csv'

export async function validateUserImport(csv: string) {
  const result = parseUserImportCsv(csv)
  if (result.errors.length === 0)
    result.errors.push(...(await userOnboarding.validateBatch(toOnboardingPlans(result.rows))).errors)
  return result
}

export function toOnboardingPlans(rows: ImportedUser[]): UserOnboardingPlan[] {
  return rows.map((row) => ({
    row: row.row,
    name: row.name,
    email: row.email,
    status: 'ACTIVE',
    placement: row.placement,
  }))
}

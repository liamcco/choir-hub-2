import type { Database } from '@/core/db/database'
import { synchronizeReferenceCatalog } from '@/features/organization/core/reference-catalog'

/** Synchronize the fixed, code-controlled organizational reference catalog. */
export async function seedFoundation(database: Database): Promise<void> {
  await synchronizeReferenceCatalog(database)
}

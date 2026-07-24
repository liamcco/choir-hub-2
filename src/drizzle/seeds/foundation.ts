import type { db } from '@/core/db'
import { synchronizeReferenceCatalog } from '@/features/organization/core/reference-catalog'

/** Synchronize the fixed, code-controlled organizational reference catalog. */
export async function seedFoundation(database: typeof db): Promise<void> {
  await synchronizeReferenceCatalog(database)
}

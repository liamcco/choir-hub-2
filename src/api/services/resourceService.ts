import { resourceSchema } from '@/api/models/resource'
import * as resourceDb from '@/db/resources/resourceRepository'
import z from 'zod'

export const resourceService = {
  /**
   * Returns a list of all resources.
   *
   * @returns An array of resource objects.
   */
  async getResources(): Promise<z.infer<typeof resourceSchema>[]> {
    return await resourceDb.getResources()
  },

  /**
   * Creates a new resource.
   *
   * @param name
   * @param description
   * @returns A promise that resolves to the created resource.
   */
  async createResource(name: string, description?: string): Promise<z.infer<typeof resourceSchema>> {
    return await resourceDb.createResource(name, description)
  },

  /**
   * Retrieves a resource by its ID.
   *
   * @param id
   * @returns A promise that resolves to the resource or null if not found.
   */
  async getResourceById(id: string): Promise<z.infer<typeof resourceSchema> | null> {
    return await resourceDb.getResourceById(id)
  },
}

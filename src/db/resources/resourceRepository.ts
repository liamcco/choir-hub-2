import { resourceSchema } from '@/api/models/resource'
import { prisma } from '@/db'
import z from 'zod'

export const resourceDb = {
  /**
   * Returns a list of all resources.
   *
   * @returns An array of resource objects.
   */
  async getResources(): Promise<z.infer<typeof resourceSchema>[]> {
    return await prisma.resource.findMany()
  },

  /**
   * Creates a new resource.
   *
   * @param name
   * @param description
   * @returns A promise that resolves to the created resource.
   */
  async createResource(name: string, description?: string): Promise<z.infer<typeof resourceSchema>> {
    return await prisma.resource.create({
      data: {
        name,
        description,
      },
    })
  },

  /**
   * Retrieves a resource by its ID.
   *
   * @param id
   * @returns A promise that resolves to the resource or null if not found.
   */
  async getResourceById(id: string): Promise<z.infer<typeof resourceSchema> | null> {
    return await prisma.resource.findUnique({
      where: { id },
    })
  },
}

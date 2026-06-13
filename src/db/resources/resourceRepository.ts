import { resourceSchema } from '@/api/models/resource'
import { prisma } from '@/db'
import z from 'zod'

/**
 * Returns a list of all resources.
 *
 * @returns An array of resource objects.
 */
export async function getResources(): Promise<z.infer<typeof resourceSchema>[]> {
  return await prisma.resource.findMany()
}

/**
 * Creates a new resource.
 *
 * @param name
 * @param description
 * @returns A promise that resolves to the created resource.
 */
export async function createResource(name: string, description?: string): Promise<z.infer<typeof resourceSchema>> {
  return await prisma.resource.create({
    data: {
      name,
      description,
    },
  })
}

/**
 * Retrieves a resource by its ID.
 *
 * @param id
 * @returns A promise that resolves to the resource or null if not found.
 */
export async function getResourceById(id: string): Promise<z.infer<typeof resourceSchema> | null> {
  return await prisma.resource.findUnique({
    where: { id },
  })
}

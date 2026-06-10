import { resourceSchema } from '@/api/models/resources';
import { prisma } from '@/db';
import z from 'zod';

export async function getResources(): Promise<z.infer<typeof resourceSchema>[]> {
  return await prisma.resource.findMany();
}

export async function createResource(name: string, description?: string): Promise<z.infer<typeof resourceSchema>> {
  return await prisma.resource.create({
    data: {
      name,
      description,
    },
  });
}

export async function getResourceById(id: string): Promise<z.infer<typeof resourceSchema> | null> {
  return await prisma.resource.findUnique({
    where: { id },
  });
}

import { prisma } from '@/db';

export async function getResources() {
  return await prisma.resource.findMany();
}

export async function createResource(name: string, description?: string) {
  return await prisma.resource.create({
    data: {
      name,
      description,
    },
  });
}

export async function getResourceById(id: string) {
  return await prisma.resource.findUnique({
    where: { id },
  });
}

import { prisma } from '@/db'

export async function getGroupKinds() {
  return await prisma.groupKind.findMany({
    orderBy: {
      name: 'asc',
    },
  })
}

export async function getGroupKindById(id: string) {
  return await prisma.groupKind.findUnique({
    where: { id },
  })
}

export async function deleteGroupKind(id: string) {
  return await prisma.groupKind.delete({
    where: { id },
  })
}

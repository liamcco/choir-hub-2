import { z } from 'zod';

export const resourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const resourcesResponseSchema = z.object({
  resources: z.array(resourceSchema),
});

export const createResourceSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

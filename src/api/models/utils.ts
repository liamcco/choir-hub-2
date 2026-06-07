import z from "zod";

export const errorResponseSchema = z.object({
  error: z.string(),
});

export const idParamsSchema = z.object({
  id: z.uuid(),
});
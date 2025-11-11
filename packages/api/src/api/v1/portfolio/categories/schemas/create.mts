import { z } from 'zod';

export const createSchema = z.object({
  id: z.string().max(50),
  description: z.string().max(250),
});

export type PortfolioCategoryCreateSchema = z.infer<typeof createSchema>;

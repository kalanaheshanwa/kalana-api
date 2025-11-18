import { z } from 'zod';

export const listQueryFilterSchema = z.object({
  categories: z.string().array(),
});

export const listQuerySchema = z.object({
  limit: z.coerce.number().positive().max(20).default(10),
  after: z.string().uuid().optional(),
  filter: z
    .string()
    .transform((arg) => JSON.parse(arg))
    .pipe(listQueryFilterSchema.partial())
    .optional(),
});

export type PortfolioListQuerySchema = z.infer<typeof listQuerySchema>;

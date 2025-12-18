import { z } from 'zod';
import { paginationSchema } from '../shared/index.mjs';

const portfolioListQueryFilterSchema = z.object({
  categories: z.string().array(),
});

export const portfolioListQuerySchema = paginationSchema.extend({
  filter: z
    .string()
    .transform((arg) => JSON.parse(arg))
    .pipe(portfolioListQueryFilterSchema.partial())
    .optional(),
});

export type PortfolioListQuerySchema = z.infer<typeof portfolioListQuerySchema>;

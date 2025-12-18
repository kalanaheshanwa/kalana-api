import { z } from 'zod';
import { paginationSchema } from '../shared/pagination.mjs';

const blogListQueryFilterSchema = z.object({
  categories: z.string().array(),
});

export const blogListQuerySchema = paginationSchema.extend({
  filter: z
    .string()
    .transform((arg) => JSON.parse(arg))
    .pipe(blogListQueryFilterSchema.partial())
    .optional(),
});

export type BlogListQuerySchema = z.infer<typeof blogListQuerySchema>;

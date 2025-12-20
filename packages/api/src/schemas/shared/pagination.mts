import z from 'zod';

export const paginationSchema = z.object({
  limit: z.coerce.number().positive().max(20).default(10),
  after: z.string().optional(),
});

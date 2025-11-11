import { z } from 'zod';

export const createSchema = z.object({
  title: z.string().max(50),
  summary: z.string().max(250),
  body: z.string().max(10_000),
  websiteUrl: z.string().url(),
  categories: z.string().max(50).array().nonempty(),
});

export type PortfolioCreateSchema = z.infer<typeof createSchema>;

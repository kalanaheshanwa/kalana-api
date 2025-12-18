import { z } from 'zod';

export const blogCreateSchema = z.object({
  canonical: z.string().max(100),
  title: z.string().max(50),
  status: z.enum(['PUBLISHED', 'DRAFT']).optional(),
  summary: z.string().max(250),
  body: z.string(),
  categories: z.string().max(50).array().nonempty(),
});

export type BlogCreateSchema = z.infer<typeof blogCreateSchema>;

export const blogUpdateSchema = blogCreateSchema.partial();

export type BlogUpdateSchema = z.infer<typeof blogUpdateSchema>;

export const blogCategoryCreateSchema = z.object({
  id: z.string().max(50),
  description: z.string().max(250),
});

export type BlogCategoryCreateSchema = z.infer<typeof blogCategoryCreateSchema>;

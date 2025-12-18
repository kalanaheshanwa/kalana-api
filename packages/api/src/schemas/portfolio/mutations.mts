import { z } from 'zod';

export const portfolioCreateSchema = z.object({
  canonical: z.string().max(100),
  title: z.string().max(50),
  status: z.enum(['PUBLISHED', 'DRAFT']).optional(),
  summary: z.string().max(250),
  body: z.string(),
  websiteUrl: z.string().url(),
  categories: z.string().max(50).array().nonempty(),
});

export type PortfolioCreateSchema = z.infer<typeof portfolioCreateSchema>;

export const portfolioUpdateSchema = portfolioCreateSchema.partial();

export type PortfolioUpdateSchema = z.infer<typeof portfolioUpdateSchema>;

export const portfolioCategoryCreateSchema = z.object({
  id: z.string().max(50),
  description: z.string().max(250),
});

export type PortfolioCategoryCreateSchema = z.infer<typeof portfolioCategoryCreateSchema>;

import { z } from 'zod';

export const portfolioCreateSchema = z.object({
  canonical: z.string().max(100),
  title: z.string().max(100),
  status: z.enum(['PUBLISHED', 'DRAFT']).optional(),
  summary: z.string(),
  body: z.string(),
  websiteUrl: z.string().url(),
  categories: z.string().max(50).array().nonempty(),
  clientName: z.string().max(100),
  coverImage: z.string().max(400),
  thumbnail: z.string().max(400),
  images: z.string().max(400).array(),
  technologies: z.string().max(100).array(),
  deliveredItems: z.string().max(800).array().max(5),
  durationDays: z.number().positive().int().max(10_000),
});

export type PortfolioCreateSchema = z.infer<typeof portfolioCreateSchema>;

export const portfolioUpdateSchema = portfolioCreateSchema.partial();

export type PortfolioUpdateSchema = z.infer<typeof portfolioUpdateSchema>;

export const portfolioCategoryCreateSchema = z.object({
  id: z.string().max(50),
  description: z.string().max(250),
});

export type PortfolioCategoryCreateSchema = z.infer<typeof portfolioCategoryCreateSchema>;

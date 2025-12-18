import { z } from 'zod';
import { paginationSchema } from '../shared/index.mjs';

export const imageListQuerySchema = paginationSchema;

export type ImageListQuerySchema = z.infer<typeof imageListQuerySchema>;

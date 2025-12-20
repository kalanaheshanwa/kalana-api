import z from 'zod';
import { paginationSchema } from '../shared/pagination.mjs';

export const contactListQuerySchema = paginationSchema;

export type ContactListQuerySchema = z.infer<typeof contactListQuerySchema>;

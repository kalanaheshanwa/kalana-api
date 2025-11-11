import * as db from 'zapatos/db';
import type * as s from 'zapatos/schema';
import { BlogCreateSchema } from '../api/v1/blog/schemas/index.mjs';
import { AppContext } from '../types/index.mjs';

export class BlogService {
  private readonly pool: AppContext['pool'];

  constructor({ pool }: AppContext) {
    this.pool = pool;
  }

  create(data: BlogCreateSchema): Promise<s.blogs.JSONSelectable> {
    return db.insert('blogs', { ...data, updatedAt: new Date() }).run(this.pool);
  }

  list(): Promise<s.blogs.Selectable[]> {
    return db.sql<s.blogs.SQL, s.blogs.Selectable[]>`
      SELECT * FROM ${'blogs'}
    `.run(this.pool);
  }
}

import * as db from 'zapatos/db';
import type * as s from 'zapatos/schema';
import { BlogCategoryCreateSchema } from '../api/v1/blog/categories/schemas/index.mjs';
import { BlogCreateSchema } from '../api/v1/blog/schemas/index.mjs';
import { AppContext } from '../types/index.mjs';
import { withUpdated } from '../utils/index.mjs';

export class BlogService {
  private readonly pool: AppContext['pool'];

  constructor({ pool }: AppContext) {
    this.pool = pool;
  }

  create(data: BlogCreateSchema): Promise<s.blogs.JSONSelectable> {
    return db.insert('blogs', withUpdated(data)).run(this.pool);
  }

  list(): Promise<s.blogs.Selectable[]> {
    return db.sql<s.blogs.SQL, s.blogs.Selectable[]>`
      SELECT * FROM ${'blogs'}
    `.run(this.pool);
  }

  createCategory(data: BlogCategoryCreateSchema): Promise<s.blog_categories.JSONSelectable> {
    return db.insert('blog_categories', withUpdated(data)).run(this.pool);
  }

  listCategories(): Promise<s.blog_categories.Selectable[]> {
    return db.sql<s.blog_categories.SQL, s.blog_categories.Selectable[]>`
      SELECT * FROM ${'blog_categories'}
    `.run(this.pool);
  }
}

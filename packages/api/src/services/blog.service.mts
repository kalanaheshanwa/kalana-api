import { DB } from '#kysely/types';
import { Kysely, sql, Transaction } from 'kysely';
import _ from 'lodash';
import type * as s from 'zapatos/schema';
import { BlogCategoryCreateSchema, BlogCreateSchema, BlogListQuerySchema } from '../schemas/index.mjs';
import { AppContext } from '../types/index.mjs';
import { paginate, withUpdated } from '../utils/index.mjs';

export class BlogService {
  readonly #db: AppContext['db'];

  constructor({ db }: AppContext) {
    this.#db = db;
  }

  create(input: BlogCreateSchema) {
    return this.#db
      .transaction()
      .setIsolationLevel('repeatable read')
      .execute(async (trx) => {
        const result = await trx
          .insertInto('blogs')
          .values(withUpdated(_.omit(input, ['categories'])))
          .returningAll()
          .executeTakeFirstOrThrow();

        // categories will always have a non-empty array - no validation needed here
        await trx
          .insertInto('categories_on_blogs')
          .values(input.categories.map((c) => ({ blogId: result.id, categoryId: c })))
          .execute();

        return this.getById(result.id, trx);
      });
  }

  update(id: string, input: Partial<BlogCreateSchema>) {
    return this.#db
      .transaction()
      .setIsolationLevel('repeatable read')
      .execute(async (trx) => {
        const updatable = _.omit(input, ['categories']);
        if (Object.keys(updatable).length) {
          await trx.updateTable('blogs').set(updatable).where('id', '=', id).returningAll().executeTakeFirstOrThrow();
        }

        if (input.categories) {
          await trx.deleteFrom('categories_on_blogs').where('blogId', '=', id).execute();
          // categories will always have a non-empty array - no validation needed here
          await trx
            .insertInto('categories_on_blogs')
            .values(input.categories.map((c) => ({ blogId: id, categoryId: c })))
            .execute();
        }

        return this.getById(id, trx);
      });
  }

  async list(input: BlogListQuerySchema) {
    let query = this.#db
      .selectFrom('blogs as b')
      .leftJoinLateral(
        (eb) =>
          eb
            .selectFrom('categories_on_blogs as cop')
            .select(({ fn }) => [fn.agg<string[]>('array_agg', ['cop.categoryId']).as('combined')])
            .whereRef('cop.blogId', '=', 'b.id')
            .as('cats'),
        (join) => join.onTrue(),
      )
      .select([
        'b.id',
        'b.canonical',
        'b.title',
        'b.status',
        'b.summary',
        'b.thumbnail',
        'b.createdAt',
        'cats.combined as categories',
      ]);

    if (input.filter?.categories?.length) {
      query = query.where('cats.combined', '&&', sql.val(input.filter.categories));
    }

    return paginate(
      query,
      { col: 'b.createdAt', direction: 'desc', output: 'createdAt' },
      { col: 'b.id', output: 'id' },
      input.limit,
      input.after,
    ).execute();
  }

  getById(id: string, trx: Transaction<DB> | Kysely<DB> = this.#db) {
    return trx
      .selectFrom('blogs as b')
      .leftJoinLateral(
        (eb) =>
          eb
            .selectFrom('categories_on_blogs as cop')
            .select(({ fn }) => [fn.agg<string[]>('array_agg', ['cop.categoryId']).as('combined')])
            .whereRef('cop.blogId', '=', 'b.id')
            .as('cats'),
        (join) => join.onTrue(),
      )
      .select([
        'b.id',
        'b.canonical',
        'b.title',
        'b.status',
        'b.summary',
        'b.thumbnail',
        'b.body',
        'b.createdAt',
        'cats.combined as categories',
      ])
      .where('id', '=', id)
      .executeTakeFirst();
  }

  getByCanonical(canonical: string) {
    return this.#db
      .selectFrom('blogs as b')
      .leftJoinLateral(
        (eb) =>
          eb
            .selectFrom('categories_on_blogs as cop')
            .select(({ fn }) => [fn.agg<string[]>('array_agg', ['cop.categoryId']).as('combined')])
            .whereRef('cop.blogId', '=', 'b.id')
            .as('cats'),
        (join) => join.onTrue(),
      )
      .select([
        'b.id',
        'b.canonical',
        'b.title',
        'b.status',
        'b.summary',
        'b.thumbnail',
        'b.body',
        'b.createdAt',
        'cats.combined as categories',
      ])
      .where('canonical', '=', canonical)
      .executeTakeFirst();
  }

  createCategory(data: BlogCategoryCreateSchema) {
    return this.#db.insertInto('blog_categories').values(withUpdated(data)).returningAll().executeTakeFirstOrThrow();
  }

  listCategories(): Promise<s.blog_categories.Selectable[]> {
    return this.#db.selectFrom('blog_categories').selectAll().execute();
  }
}

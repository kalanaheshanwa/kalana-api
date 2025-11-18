import { sql } from 'kysely';
import _ from 'lodash';
import * as db from 'zapatos/db';
import type * as s from 'zapatos/schema';
import { PortfolioCategoryCreateSchema } from '../api/v1/portfolio/categories/schemas/index.mjs';
import { PortfolioCreateSchema, PortfolioListQuerySchema } from '../api/v1/portfolio/schemas/index.mjs';
import { AppContext } from '../types/index.mjs';
import { pagination, withUpdated } from '../utils/index.mjs';

export class PortfolioService {
  readonly #pool: AppContext['pool'];
  readonly #db: AppContext['db'];

  constructor({ pool, db }: AppContext) {
    this.#pool = pool;
    this.#db = db;
  }

  create(data: PortfolioCreateSchema): Promise<s.portfolios.JSONSelectable> {
    return db.transaction(this.#pool, db.IsolationLevel.RepeatableRead, async (txn) => {
      const result = await db.insert('portfolios', withUpdated(_.omit(data, ['categories']))).run(txn);

      await db
        .insert(
          'categories_on_portfolios',
          data.categories.map((c) => ({ portfolioId: result.id, categoryId: c })),
        )
        .run(txn);

      return result;
    });
  }

  async list(input: PortfolioListQuerySchema) {
    let query = this.#db
      .selectFrom('portfolios as p')
      .leftJoinLateral(
        (eb) =>
          eb
            .selectFrom('categories_on_portfolios as cop')
            .select(({ fn }) => [fn.agg<string[]>('array_agg', ['cop.categoryId']).as('combined')])
            .whereRef('cop.portfolioId', '=', 'p.id')
            .as('cats'),
        (join) => join.onTrue(),
      )
      .select(['p.id', 'p.title', 'p.summary', 'p.createdAt', 'cats.combined']);

    if (input.after) {
      query = query.where('p.id', '>', input.after);
    }

    if (input.filter?.categories?.length) {
      query = query.where('cats.combined', '&&', sql.val(input.filter.categories));
    }

    query = query.orderBy('p.createdAt', 'desc').orderBy('p.id', 'asc').limit(input.limit);

    return pagination(await query.execute(), input.limit);
  }

  createCategory(data: PortfolioCategoryCreateSchema): Promise<s.portfolio_categories.JSONSelectable> {
    return db.insert('portfolio_categories', withUpdated(data)).run(this.#pool);
  }

  listCategories(): Promise<s.portfolio_categories.Selectable[]> {
    return db.sql<s.portfolio_categories.SQL, s.portfolio_categories.Selectable[]>`
        SELECT * FROM ${'portfolio_categories'}
      `.run(this.#pool);
  }
}

import { sql } from 'kysely';
import _ from 'lodash';
import { PortfolioCategoryCreateSchema } from '../api/v1/portfolio/categories/schemas/index.mjs';
import { PortfolioCreateSchema, PortfolioListQuerySchema } from '../api/v1/portfolio/schemas/index.mjs';
import { AppContext } from '../types/index.mjs';
import { pagination, withUpdated } from '../utils/index.mjs';

export class PortfolioService {
  readonly #db: AppContext['db'];

  constructor({ db }: AppContext) {
    this.#db = db;
  }

  create(input: PortfolioCreateSchema) {
    return this.#db
      .transaction()
      .setIsolationLevel('repeatable read')
      .execute(async (trx) => {
        const result = await trx
          .insertInto('portfolios')
          .values(withUpdated(_.omit(input, ['categories'])))
          .returningAll()
          .executeTakeFirstOrThrow();

        // categories will always have a non-empty array - no validation needed here
        let insertQuery = trx.insertInto('categories_on_portfolios');
        for (const categoryId of input.categories) {
          insertQuery = insertQuery.values({ portfolioId: result.id, categoryId });
        }
        await insertQuery.execute();

        return result;
      });
  }

  update(id: string, input: Partial<PortfolioCreateSchema>) {
    return this.#db
      .transaction()
      .setIsolationLevel('repeatable read')
      .execute(async (trx) => {
        const result = await trx
          .updateTable('portfolios')
          .set(_.omit(input, ['categories']))
          .where('id', '=', id)
          .returningAll()
          .executeTakeFirstOrThrow();

        if (input.categories) {
          await trx.deleteFrom('categories_on_portfolios').where('portfolioId', '=', result.id).execute();
          // categories will always have a non-empty array - no validation needed here
          let insertQuery = trx.insertInto('categories_on_portfolios');
          for (const categoryId of input.categories) {
            insertQuery = insertQuery.values({ portfolioId: result.id, categoryId });
          }
          await insertQuery.execute();
        }

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
      .select([
        'p.id',
        'p.canonical',
        'p.title',
        'p.status',
        'p.summary',
        'p.createdAt',
        'cats.combined as categories',
      ]);

    if (input.after) {
      query = query.where('p.id', '>', input.after);
    }

    if (input.filter?.categories?.length) {
      query = query.where('cats.combined', '&&', sql.val(input.filter.categories));
    }

    query = query.orderBy('p.createdAt', 'desc').orderBy('p.id', 'asc').limit(input.limit);

    return pagination(await query.execute(), input.limit);
  }

  getById(id: string) {
    return this.#db
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
      .select([
        'p.id',
        'p.canonical',
        'p.title',
        'p.status',
        'p.summary',
        'p.websiteUrl',
        'p.body',
        'p.createdAt',
        'cats.combined as categories',
      ])
      .where('id', '=', id)
      .executeTakeFirst();
  }

  createCategory(data: PortfolioCategoryCreateSchema) {
    return this.#db
      .insertInto('portfolio_categories')
      .values(withUpdated(data))
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  listCategories() {
    return this.#db.selectFrom('portfolio_categories').selectAll().execute();
  }
}

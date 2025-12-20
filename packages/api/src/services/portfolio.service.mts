import { Kysely, sql, Transaction } from 'kysely';
import _ from 'lodash';
import { DB } from '../../generated/kysely/schema.js';
import { PortfolioCategoryCreateSchema, PortfolioCreateSchema, PortfolioListQuerySchema } from '../schemas/index.mjs';
import { AppContext } from '../types/index.mjs';
import { paginate, withUpdated } from '../utils/index.mjs';

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
          .returning(['id'])
          .executeTakeFirstOrThrow();

        // categories will always have a non-empty array - no validation needed here
        await trx
          .insertInto('categories_on_portfolios')
          .values(input.categories.map((c) => ({ portfolioId: result.id, categoryId: c })))
          .execute();

        return this.getById(result.id, trx);
      });
  }

  update(id: string, input: Partial<PortfolioCreateSchema>) {
    return this.#db
      .transaction()
      .setIsolationLevel('repeatable read')
      .execute(async (trx) => {
        const updatable = _.omit(input, ['categories']);

        if (Object.keys(updatable).length) {
          await trx
            .updateTable('portfolios')
            .set(updatable)
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow();
        }

        if (input.categories) {
          await trx.deleteFrom('categories_on_portfolios').where('portfolioId', '=', id).execute();
          // categories will always have a non-empty array - no validation needed here
          await trx
            .insertInto('categories_on_portfolios')
            .values(input.categories.map((c) => ({ portfolioId: id, categoryId: c })))
            .execute();
        }

        return this.getById(id, trx);
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
        'p.thumbnail',
        'p.createdAt',
        'cats.combined as categories',
      ]);

    if (input.filter?.categories?.length) {
      query = query.where('cats.combined', '&&', sql.val(input.filter.categories));
    }

    return paginate(
      query,
      { col: 'p.createdAt', direction: 'desc', output: 'createdAt' },
      { col: 'p.id', output: 'id' },
      input.limit,
      input.after,
    ).execute();
  }

  getById(id: string, trx: Transaction<DB> | Kysely<DB> = this.#db) {
    return trx
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
        'p.thumbnail',
        'p.websiteUrl',
        'p.body',
        'p.createdAt',
        'cats.combined as categories',
      ])
      .where('id', '=', id)
      .executeTakeFirst();
  }

  getByCanonical(canonical: string) {
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
        'p.thumbnail',
        'p.websiteUrl',
        'p.body',
        'p.createdAt',
        'cats.combined as categories',
      ])
      .where('canonical', '=', canonical)
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

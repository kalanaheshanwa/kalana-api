import * as db from 'zapatos/db';
import type * as s from 'zapatos/schema';
import { PortfolioCategoryCreateSchema } from '../api/v1/portfolio/categories/schemas/index.mjs';
import { PortfolioCreateSchema } from '../api/v1/portfolio/schemas/index.mjs';
import { AppContext } from '../types/index.mjs';
import { withUpdated } from '../utils/index.mjs';

export class PortfolioService {
  private readonly pool: AppContext['pool'];

  constructor({ pool }: AppContext) {
    this.pool = pool;
  }

  create(data: PortfolioCreateSchema): Promise<s.portfolios.JSONSelectable> {
    return db.insert('portfolios', withUpdated(data)).run(this.pool);
  }

  list(): Promise<s.portfolios.Selectable[]> {
    return db.sql<s.portfolios.SQL, s.portfolios.Selectable[]>`
      SELECT * FROM ${'portfolios'}
    `.run(this.pool);
  }

  createCategory(data: PortfolioCategoryCreateSchema): Promise<s.portfolio_categories.JSONSelectable> {
    return db.insert('portfolio_categories', withUpdated(data)).run(this.pool);
  }

  listCategories(): Promise<s.portfolio_categories.Selectable[]> {
    return db.sql<s.portfolio_categories.SQL, s.portfolio_categories.Selectable[]>`
        SELECT * FROM ${'portfolio_categories'}
      `.run(this.pool);
  }
}

import * as db from 'zapatos/db';
import type * as s from 'zapatos/schema';
import { PortfolioCreateSchema } from '../api/v1/portfolio/schemas/index.mjs';
import { AppContext } from '../types/index.mjs';

export class PortfolioService {
  private readonly pool: AppContext['pool'];

  constructor({ pool }: AppContext) {
    this.pool = pool;
  }

  create(data: PortfolioCreateSchema): Promise<s.portfolios.JSONSelectable> {
    return db.insert('portfolios', { ...data, updatedAt: new Date() }).run(this.pool);
  }

  list(): Promise<s.portfolios.Selectable[]> {
    return db.sql<s.portfolios.SQL, s.portfolios.Selectable[]>`
      SELECT * FROM ${'portfolios'}
    `.run(this.pool);
  }
}

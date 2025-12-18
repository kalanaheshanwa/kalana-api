import { Router } from 'express';
import { asyncMiddleware } from '../../../../../middleware/index.mjs';
import { PortfolioService } from '../../../../../services/index.mjs';
import { AppContext } from '../../../../../types/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _portfolio = new PortfolioService(context);

  /**
   * @openapi
   * /api/v1/portfolios/categories:
   *   get:
   *     tags:
   *       - Portfolio
   *     summary: List all portfolio categories paginated
   *     responses:
   *       201:
   *         description: List all portfolio categories paginated
   */
  router.get(
    '/',
    asyncMiddleware(async (_req, res) => {
      const data = await _portfolio.listCategories();

      return res.status(200).json({ data });
    }),
  );

  return router;
}

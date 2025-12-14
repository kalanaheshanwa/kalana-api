import { Router } from 'express';
import { asyncMiddleware, validateSchema } from '../../../../middleware/index.mjs';
import { PortfolioService } from '../../../../services/index.mjs';
import { AppContext } from '../../../../types/index.mjs';
import { createSchema } from './schemas/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _portfolio = new PortfolioService(context);

  /**
   * @openapi
   * /api/v1/portfolios/categories:
   *   get:
   *     tags:
   *       - Portfolio
   *     security:
   *       - bearerAuth: []
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

  /**
   * @openapi
   * /api/v1/portfolios/categories:
   *   post:
   *     tags:
   *       - Portfolio
   *     security:
   *       - bearerAuth: []
   *     summary: Creates a portfolio category
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/CategoryCreate"
   *     responses:
   *       201:
   *         description: Creates an entry in portfolio_categories
   */
  router.post(
    '/',
    validateSchema(createSchema),
    asyncMiddleware(async (req, res) => {
      const data = await _portfolio.createCategory(req.body);

      return res.status(201).json({ data });
    }),
  );

  return router;
}

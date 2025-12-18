import { Router } from 'express';
import { asyncMiddleware, isAuthenticated, validateSchema } from '../../../../../middleware/index.mjs';
import { portfolioCategoryCreateSchema } from '../../../../../schemas/index.mjs';
import { PortfolioService } from '../../../../../services/index.mjs';
import { AppContext } from '../../../../../types/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _portfolio = new PortfolioService(context);

  /**
   * @openapi
   * /api/v1/admin/portfolios/categories:
   *   post:
   *     tags:
   *       - Portfolio
   *       - Admin
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
    isAuthenticated(context),
    validateSchema(portfolioCategoryCreateSchema),
    asyncMiddleware(async (req, res) => {
      const data = await _portfolio.createCategory(req.body);

      return res.status(201).json({ data });
    }),
  );

  return router;
}

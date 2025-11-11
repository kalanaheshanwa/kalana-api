import { Router } from 'express';
import { asyncMiddleware, validateSchema } from '../../../middleware/index.mjs';
import { PortfolioService } from '../../../services/index.mjs';
import { AppContext } from '../../../types/index.mjs';
import { createSchema } from './schemas/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _portfolio = new PortfolioService(context);

  /**
   * @openapi
   * /api/v1/portfolio:
   *   get:
   *     tags:
   *       - Portfolio
   *     summary: List all portfolios paginated
   *     responses:
   *       201:
   *         description: List all portfolios paginated
   */
  router.get(
    '/',
    asyncMiddleware(async (_req, res) => {
      const data = await _portfolio.list();

      return res.status(200).json({ data });
    }),
  );

  /**
   * @openapi
   * /api/v1/portfolio:
   *   post:
   *     tags:
   *       - Portfolio
   *     summary: Creates a portfolio
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/PortfolioCreate"
   *     responses:
   *       201:
   *         description: Creates an entry in portfolios
   */
  router.post(
    '/',
    validateSchema(createSchema),
    asyncMiddleware(async (req, res) => {
      const data = await _portfolio.create(req.body);

      return res.status(201).json({ data });
    }),
  );

  return router;
}

import { Router } from 'express';
import { asyncMiddleware, validateSchema } from '../../../middleware/index.mjs';
import { PortfolioService } from '../../../services/index.mjs';
import { AppContext } from '../../../types/index.mjs';
import categories from './categories/index.mjs';
import { createSchema, listQuerySchema, PortfolioListQuerySchema } from './schemas/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _portfolio = new PortfolioService(context);

  router.use('/categories', categories(context));

  /**
   * @openapi
   * /api/v1/portfolios:
   *   get:
   *     tags:
   *       - Portfolio
   *     summary: List all portfolios paginated
   *     parameters:
   *       - name: limit
   *         in: query
   *         description: Number of items to return
   *         required: false
   *         schema:
   *           type: integer
   *           format: int32
   *           minimum: 1
   *           maximum: 20
   *       - name: after
   *         in: query
   *         description: Cursor of the last item
   *         required: false
   *         schema:
   *           type: string
   *       - name: filter
   *         in: query
   *         description: Stringified JSON object
   *         required: false
   *         schema:
   *           type: string
   *         example: '{"categories":["Business"]}'
   *     responses:
   *       201:
   *         description: List all portfolios paginated
   */
  router.get(
    '/',
    validateSchema(listQuerySchema, 'query'),
    asyncMiddleware(async (req, res) => {
      const data = await _portfolio.list(req.query as unknown as PortfolioListQuerySchema);

      return res.status(200).json({ data });
    }),
  );

  /**
   * @openapi
   * /api/v1/portfolios:
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

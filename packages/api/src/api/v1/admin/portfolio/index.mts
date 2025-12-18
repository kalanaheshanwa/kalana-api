import { Router } from 'express';
import { asyncMiddleware, validateSchema } from '../../../../middleware/index.mjs';
import { portfolioCreateSchema, portfolioUpdateSchema } from '../../../../schemas/index.mjs';
import { PortfolioService } from '../../../../services/index.mjs';
import { AppContext } from '../../../../types/index.mjs';
import categories from './categories/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _portfolio = new PortfolioService(context);

  router.use('/categories', categories(context));

  /**
   * @openapi
   * /api/v1/admin/portfolios:
   *   post:
   *     tags:
   *       - Portfolio
   *       - Admin
   *     security:
   *       - bearerAuth: []
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
    validateSchema(portfolioCreateSchema),
    asyncMiddleware(async (req, res) => {
      const data = await _portfolio.create(req.body);

      return res.status(201).json({ data });
    }),
  );

  /**
   * @openapi
   * /api/v1/admin/portfolios/{id}:
   *   get:
   *     tags:
   *       - Portfolio
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     summary: Get a portfolio
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Id of the item to update
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       201:
   *         description: Get an entry in portfolios
   */
  router.get(
    '/:id',
    asyncMiddleware(async (req, res) => {
      const data = await _portfolio.getById(req.params.id);

      return res.status(200).json({ data });
    }),
  );

  /**
   * @openapi
   * /api/v1/admin/portfolios/{id}:
   *   put:
   *     tags:
   *       - Portfolio
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     summary: Updates a portfolio
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Id of the item to update
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/PortfolioCreate"
   *     responses:
   *       201:
   *         description: Updates an entry in portfolios
   */
  router.put(
    '/:id',
    validateSchema(portfolioUpdateSchema),
    asyncMiddleware(async (req, res) => {
      const data = await _portfolio.update(req.params.id, req.body);

      return res.status(200).json({ data });
    }),
  );

  return router;
}

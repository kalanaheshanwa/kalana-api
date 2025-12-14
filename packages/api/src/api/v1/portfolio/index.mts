import { Router } from 'express';
import { asyncMiddleware, isAuthenticated, validateSchema } from '../../../middleware/index.mjs';
import { PortfolioService } from '../../../services/index.mjs';
import { AppContext } from '../../../types/index.mjs';
import categories from './categories/index.mjs';
import { createSchema, listQuerySchema, PortfolioListQuerySchema, updateSchema } from './schemas/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _portfolio = new PortfolioService(context);

  router.use('/categories', isAuthenticated(context), categories(context));

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
    isAuthenticated(context),
    validateSchema(createSchema),
    asyncMiddleware(async (req, res) => {
      const data = await _portfolio.create(req.body);

      return res.status(201).json({ data });
    }),
  );

  /**
   * @openapi
   * /api/v1/portfolios/{id}:
   *   get:
   *     tags:
   *       - Portfolio
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
    isAuthenticated(context),
    asyncMiddleware(async (req, res) => {
      const data = await _portfolio.getById(req.params.id);

      return res.status(200).json({ data });
    }),
  );

  /**
   * @openapi
   * /api/v1/portfolios/{id}:
   *   put:
   *     tags:
   *       - Portfolio
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
    isAuthenticated(context),
    validateSchema(updateSchema),
    asyncMiddleware(async (req, res) => {
      const data = await _portfolio.update(req.params.id, req.body);

      return res.status(200).json({ data });
    }),
  );

  return router;
}

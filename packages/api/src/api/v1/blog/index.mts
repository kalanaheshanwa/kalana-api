import { Router } from 'express';
import { asyncMiddleware, validateSchema } from '../../../middleware/index.mjs';
import { BlogService } from '../../../services/index.mjs';
import { AppContext } from '../../../types/index.mjs';
import categories from './categories/index.mjs';
import { BlogListQuerySchema, createSchema, listQuerySchema, updateSchema } from './schemas/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _blog = new BlogService(context);

  router.use('/categories', categories(context));

  /**
   * @openapi
   * /api/v1/blogs:
   *   get:
   *     tags:
   *       - Blog
   *     summary: List all blogs paginated
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
   *       200:
   *         description: List all blogs paginated
   */
  router.get(
    '/',
    validateSchema(listQuerySchema, 'query'),
    asyncMiddleware(async (req, res) => {
      const nodes = await _blog.list(req.query as unknown as BlogListQuerySchema);

      return res.status(200).json({ data: nodes });
    }),
  );

  /**
   * @openapi
   * /api/v1/blogs:
   *   post:
   *     tags:
   *       - Blog
   *     summary: Creates a blog
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/BlogCreate"
   *     responses:
   *       201:
   *         description: Creates an entry in blogs
   */
  router.post(
    '/',
    validateSchema(createSchema),
    asyncMiddleware(async (req, res) => {
      const data = await _blog.create(req.body);

      return res.status(201).json({ data });
    }),
  );

  /**
   * @openapi
   * /api/v1/blogs/{id}:
   *   get:
   *     tags:
   *       - Blog
   *     summary: Get a blog
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Id of the item to update
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       201:
   *         description: Get an entry in blogs
   */
  router.get(
    '/:id',
    asyncMiddleware(async (req, res) => {
      const data = await _blog.getById(req.params.id);

      return res.status(200).json({ data });
    }),
  );

  /**
   * @openapi
   * /api/v1/blogs/{id}:
   *   put:
   *     tags:
   *       - Blog
   *     summary: Updates a blog
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
   *             $ref: "#/components/schemas/BlogCreate"
   *     responses:
   *       201:
   *         description: Updates an entry in blogs
   */
  router.put(
    '/:id',
    validateSchema(updateSchema),
    asyncMiddleware(async (req, res) => {
      const data = await _blog.update(req.params.id, req.body);

      return res.status(200).json({ data });
    }),
  );

  return router;
}

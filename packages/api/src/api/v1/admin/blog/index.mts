import { Router } from 'express';
import { asyncMiddleware, validateSchema } from '../../../../middleware/index.mjs';
import { blogCreateSchema, blogUpdateSchema } from '../../../../schemas/index.mjs';
import { BlogService } from '../../../../services/index.mjs';
import { AppContext } from '../../../../types/index.mjs';
import categories from './categories/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _blog = new BlogService(context);

  router.use('/categories', categories(context));

  /**
   * @openapi
   * /api/v1/admin/blogs:
   *   post:
   *     tags:
   *       - Blog
   *       - Admin
   *     security:
   *       - bearerAuth: []
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
    validateSchema(blogCreateSchema),
    asyncMiddleware(async (req, res) => {
      const data = await _blog.create(req.body);

      return res.status(201).json({ data });
    }),
  );

  /**
   * @openapi
   * /api/v1/admin/blogs/{id}:
   *   get:
   *     tags:
   *       - Blog
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     summary: Get a blog
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Id of the item to update
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
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
   * /api/v1/admin/blogs/{id}:
   *   put:
   *     tags:
   *       - Blog
   *       - Admin
   *     security:
   *       - bearerAuth: []
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
   *       200:
   *         description: Updates an entry in blogs
   */
  router.put(
    '/:id',
    validateSchema(blogUpdateSchema),
    asyncMiddleware(async (req, res) => {
      const data = await _blog.update(req.params.id, req.body);

      return res.status(200).json({ data });
    }),
  );

  return router;
}

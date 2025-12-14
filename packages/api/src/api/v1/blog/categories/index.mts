import { Router } from 'express';
import { asyncMiddleware, validateSchema } from '../../../../middleware/index.mjs';
import { BlogService } from '../../../../services/index.mjs';
import { AppContext } from '../../../../types/index.mjs';
import { createSchema } from './schemas/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _blog = new BlogService(context);

  /**
   * @openapi
   * /api/v1/blogs/categories:
   *   get:
   *     tags:
   *       - Blog
   *     security:
   *       - bearerAuth: []
   *     summary: List all blog categories paginated
   *     responses:
   *       201:
   *         description: List all blog categories paginated
   */
  router.get(
    '/',
    asyncMiddleware(async (_req, res) => {
      const data = await _blog.listCategories();

      return res.status(200).json({ data });
    }),
  );

  /**
   * @openapi
   * /api/v1/blogs/categories:
   *   post:
   *     tags:
   *       - Blog
   *     security:
   *       - bearerAuth: []
   *     summary: Creates a blog category
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/CategoryCreate"
   *     responses:
   *       201:
   *         description: Creates an entry in blog_categories
   */
  router.post(
    '/',
    validateSchema(createSchema),
    asyncMiddleware(async (req, res) => {
      const data = await _blog.createCategory(req.body);

      return res.status(201).json({ data });
    }),
  );

  return router;
}

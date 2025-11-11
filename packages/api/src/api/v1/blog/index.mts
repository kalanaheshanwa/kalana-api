import { Router } from 'express';
import { asyncMiddleware, validateSchema } from '../../../middleware/index.mjs';
import { BlogService } from '../../../services/index.mjs';
import { AppContext } from '../../../types/index.mjs';
import { createSchema } from './schemas/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _blog = new BlogService(context);

  /**
   * @openapi
   * /api/v1/blog:
   *   get:
   *     tags:
   *       - Blog
   *     summary: List all blogs paginated
   *     responses:
   *       201:
   *         description: List all blogs paginated
   */
  router.get(
    '/',
    asyncMiddleware(async (_req, res) => {
      const data = await _blog.list();

      return res.status(200).json({ data });
    }),
  );

  /**
   * @openapi
   * /api/v1/blog:
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

  return router;
}

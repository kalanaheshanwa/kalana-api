import { Router } from 'express';
import { asyncMiddleware, validateSchema } from '../../../../middleware/index.mjs';
import { BlogListQuerySchema, blogListQuerySchema } from '../../../../schemas/index.mjs';
import { BlogService } from '../../../../services/index.mjs';
import { AppContext } from '../../../../types/index.mjs';
import categories from './categories/index.mjs';

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
    validateSchema(blogListQuerySchema, 'query'),
    asyncMiddleware(async (req, res) => {
      const nodes = await _blog.list(req.query as unknown as BlogListQuerySchema);

      return res.status(200).json({ data: nodes });
    }),
  );

  return router;
}

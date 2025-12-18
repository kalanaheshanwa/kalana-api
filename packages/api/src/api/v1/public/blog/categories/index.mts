import { Router } from 'express';
import { asyncMiddleware } from '../../../../../middleware/async.mjs';
import { BlogService } from '../../../../../services/index.mjs';
import { AppContext } from '../../../../../types/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _blog = new BlogService(context);

  /**
   * @openapi
   * /api/v1/blogs/categories:
   *   get:
   *     tags:
   *       - Blog
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

  return router;
}

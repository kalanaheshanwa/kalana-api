import { Router } from 'express';
import { asyncMiddleware, validateSchema } from '../../../../../middleware/index.mjs';
import { blogCategoryCreateSchema } from '../../../../../schemas/index.mjs';
import { BlogService } from '../../../../../services/index.mjs';
import { AppContext } from '../../../../../types/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _blog = new BlogService(context);

  /**
   * @openapi
   * /api/v1/admin/blogs/categories:
   *   post:
   *     tags:
   *       - Blog
   *       - Admin
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
    validateSchema(blogCategoryCreateSchema),
    asyncMiddleware(async (req, res) => {
      const data = await _blog.createCategory(req.body);

      return res.status(201).json({ data });
    }),
  );

  return router;
}

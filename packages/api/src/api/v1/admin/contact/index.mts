import { Router } from 'express';
import { asyncMiddleware } from '../../../../middleware/index.mjs';
import { ContactService } from '../../../../services/index.mjs';
import { AppContext } from '../../../../types/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _contact = new ContactService(context);

  /**
   * @openapi
   * /api/v1/admin/contacts:
   *   get:
   *     tags:
   *       - Contact
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     summary: List all contact submissions paginated
   *     responses:
   *       200:
   *         description: List all contact submissions paginated
   */
  router.get(
    '/',
    asyncMiddleware(async (_req, res) => {
      const data = await _contact.list();

      return res.status(200).json({ data });
    }),
  );

  return router;
}

import { Router } from 'express';
import { asyncMiddleware, validateSchema } from '../../../../middleware/index.mjs';
import { ContactListQuerySchema, contactListQuerySchema } from '../../../../schemas/index.mjs';
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
   *     responses:
   *       200:
   *         description: List all contact submissions paginated
   */
  router.get(
    '/',
    validateSchema(contactListQuerySchema, 'query'),
    asyncMiddleware(async (req, res) => {
      const data = await _contact.list(req.query as unknown as ContactListQuerySchema);

      return res.status(200).json({ data });
    }),
  );

  /**
   * @openapi
   * /api/v1/admin/contacts/{id}:
   *   get:
   *     tags:
   *       - Contact
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     summary: Get a contact
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Id of the item to update
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Get an entry in contact_submissions
   */
  router.get(
    '/:id',
    asyncMiddleware(async (req, res) => {
      const data = await _contact.getById(req.params.id);

      return res.status(200).json({ data });
    }),
  );

  /**
   * @openapi
   * /api/v1/admin/contacts/{id}/read:
   *   get:
   *     tags:
   *       - Contact
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     summary: Mark a contact as read
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Id of the item to update
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Set read column to true of an entry in contact_submissions
   */
  router.put(
    '/:id/read',
    asyncMiddleware(async (req, res) => {
      await _contact.setRead(req.params.id);

      return res.status(200).json({ data: null });
    }),
  );

  return router;
}

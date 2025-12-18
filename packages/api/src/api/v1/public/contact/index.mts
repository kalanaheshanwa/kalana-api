import { Router } from 'express';
import { asyncMiddleware, validateSchema } from '../../../../middleware/index.mjs';
import { submissionSchema } from '../../../../schemas/contact/index.mjs';
import { ContactService } from '../../../../services/index.mjs';
import { AppContext } from '../../../../types/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  const _contact = new ContactService(context);

  /**
   * @openapi
   * /api/v1/contact:
   *   get:
   *     tags:
   *       - Contact
   *     summary: List all contact submissions paginated
   *     responses:
   *       201:
   *         description: List all contact submissions paginated
   */
  router.get(
    '/',
    asyncMiddleware(async (_req, res) => {
      const data = await _contact.list();

      return res.status(200).json({ data });
    }),
  );

  /**
   * @openapi
   * /api/v1/contact:
   *   post:
   *     tags:
   *       - Contact
   *     summary: Creates a contact submission
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/ContactSubmission"
   *     responses:
   *       201:
   *         description: Creates an entry in contact submissions
   */
  router.post(
    '/',
    validateSchema(submissionSchema),
    asyncMiddleware(async (req, res) => {
      const data = await _contact.create(req.body);

      return res.status(201).json({ data });
    }),
  );

  return router;
}
